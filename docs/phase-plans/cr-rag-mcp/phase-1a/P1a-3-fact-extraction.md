# P1a-3: 구조화 팩트 추출

## 목표

diff에서 LLM 없이 결정론적으로 구조화 팩트(StructuredFacts)를 추출한다. hunk 헤더 파싱으로 L1(파일 역할) + L2(심볼명)까지 추출하고, 사용자 정의 파일 역할 매핑을 지원한다.

---

## 선행 조건

- P1a-2 완료 — GitCollector로 커밋 diff 추출 가능

---

## 참조 설계 문서

| 문서                  | 섹션                  | 참조 내용                                                  |
| --------------------- | --------------------- | ---------------------------------------------------------- |
| `02-data-pipeline.md` | §4-1 구조화 팩트 추출 | 추출 항목 테이블, StructuredFacts/FileChange 인터페이스    |
| `02-data-pipeline.md` | §4-3 코드 구조 추출   | L1~L2 추출 수준, CodeStructure 인터페이스, inferFileRole() |
| `02-data-pipeline.md` | §4-3 file_role 추론   | .cursor/cr-rag-mcp.yaml 사용자 정의, 내장 패턴             |

---

## 생성/수정 파일 목록

| 파일                            | 역할                                            |
| ------------------------------- | ----------------------------------------------- |
| `src/processing/extractor.ts`   | diff → StructuredFacts 변환                     |
| `src/processing/hunk_parser.ts` | diff hunk 헤더에서 함수명/클래스명 추출         |
| `src/processing/file_role.ts`   | 파일 경로 → 역할 추론 (사용자 정의 + 내장 패턴) |
| `src/types/facts.ts`            | StructuredFacts, FileChange, CodeStructure 타입 |
| `src/config/loader.ts`          | .cursor/cr-rag-mcp.yaml 설정 로더               |
| `src/types/config.ts`           | CrRagConfig 타입                                |

---

## 구현 상세

### src/types/facts.ts

```typescript
export interface StructuredFacts {
    commit_hash: string;
    author: string;
    date: string;
    message: string;
    conventional_type?: string; // feat, fix, refactor, ...
    conventional_scope?: string;
    files: FileChange[];
    total_additions: number;
    total_deletions: number;
}

export interface FileChange {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    old_path?: string;
    additions: number;
    deletions: number;
    functions_modified: string[]; // hunk 헤더에서 추출
    file_role: string; // component, util, api, ...
}
```

### src/types/config.ts

```typescript
export interface CrRagConfig {
    file_roles?: {
        custom_rules?: Array<{ pattern: string; role: string }>;
        additional_roles?: string[];
        use_builtin_patterns?: boolean;
    };
    grouping?: {
        time_gap_minutes?: number;
        require_file_overlap?: boolean;
    };
    diff_size_gate?: {
        small_max_lines?: number;
        medium_max_lines?: number;
    };
}
```

### src/processing/hunk_parser.ts

```typescript
const HUNK_HEADER_RE = /^@@\s.*?\s@@\s*(.+)?$/;

export function extractSymbolsFromHunks(patch: string): string[] {
    const symbols: string[] = [];
    for (const line of patch.split('\n')) {
        const match = line.match(HUNK_HEADER_RE);
        if (match?.[1]) {
            const context = match[1].trim();
            // "function validateToken(token: string)" → "validateToken"
            // "class AuthService" → "AuthService"
            const func_match = context.match(/(?:function|async\s+function)\s+(\w+)/);
            const class_match = context.match(/(?:class|interface)\s+(\w+)/);
            const method_match = context.match(/(?:async\s+)?(\w+)\s*\(/);

            if (func_match) symbols.push(func_match[1]);
            else if (class_match) symbols.push(class_match[1]);
            else if (method_match) symbols.push(method_match[1]);
        }
    }
    return [...new Set(symbols)];
}
```

### src/processing/file_role.ts

```typescript
import type { CrRagConfig } from '../types/config.js';

export function inferFileRole(path: string, config?: CrRagConfig): string {
    if (config?.file_roles?.custom_rules) {
        for (const rule of config.file_roles.custom_rules) {
            if (new RegExp(rule.pattern).test(path)) return rule.role;
        }
    }

    if (config?.file_roles?.use_builtin_patterns !== false) {
        if (/\.(test|spec)\.(ts|js|tsx|jsx)$/.test(path)) return 'test';
        if (/\/components\//.test(path)) return 'component';
        if (/\/hooks\/|\/composables\//.test(path)) return 'hook';
        if (/\/api\/|\/services\//.test(path)) return 'api';
        if (/\/store\/|\/stores\//.test(path)) return 'store';
        if (/\/utils\/|\/helpers\/|\/lib\//.test(path)) return 'util';
        if (/\/types\/|\.d\.ts$/.test(path)) return 'type';
        if (/\.(config|rc)\.(ts|js|json)$/.test(path)) return 'config';
    }

    return 'unknown';
}
```

### src/processing/extractor.ts 핵심

```typescript
import type { RawCommit, RawDiff } from '../types/git.js';
import type { StructuredFacts, FileChange } from '../types/facts.js';
import type { CrRagConfig } from '../types/config.js';
import { extractSymbolsFromHunks } from './hunk_parser.js';
import { inferFileRole } from './file_role.js';

const CONVENTIONAL_RE = /^(\w+)(?:\(([^)]+)\))?!?:\s*(.+)$/;

export function extractStructuredFacts(commit: RawCommit, diff: RawDiff, config?: CrRagConfig): StructuredFacts {
    const conventional = commit.subject.match(CONVENTIONAL_RE);

    const files: FileChange[] = diff.files.map((f) => ({
        path: f.path,
        status: f.status,
        old_path: f.old_path,
        additions: f.additions,
        deletions: f.deletions,
        functions_modified: extractSymbolsFromHunks(f.patch),
        file_role: inferFileRole(f.path, config),
    }));

    return {
        commit_hash: commit.hash,
        author: commit.author,
        date: commit.date,
        message: commit.subject,
        conventional_type: conventional?.[1],
        conventional_scope: conventional?.[2],
        files,
        total_additions: files.reduce((sum, f) => sum + f.additions, 0),
        total_deletions: files.reduce((sum, f) => sum + f.deletions, 0),
    };
}
```

### src/config/loader.ts 핵심

```typescript
import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import type { CrRagConfig } from '../types/config.js';

export async function loadConfig(project_root: string): Promise<CrRagConfig> {
    const config_path = `${project_root}/.cursor/cr-rag-mcp.yaml`;
    try {
        const raw = await readFile(config_path, 'utf-8');
        return parseYaml(raw) as CrRagConfig;
    } catch {
        return {}; // 설정 파일 없으면 기본값
    }
}
```

---

## 완료 기준

- [ ] diff에서 StructuredFacts 추출 성공 (파일 목록, 변경 통계, 함수명)
- [ ] hunk 헤더에서 함수명/클래스명 추출 정확도 확인 (수동 샘플 10건)
- [ ] Conventional Commits 형식 커밋 메시지 파싱 동작
- [ ] 사용자 정의 file_role 매핑 (.cursor/cr-rag-mcp.yaml) 동작
- [ ] 내장 패턴 폴백 동작
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ P1a-4: LLM 요약 + 추론 태깅 (`P1a-4-llm-summary.md`)
