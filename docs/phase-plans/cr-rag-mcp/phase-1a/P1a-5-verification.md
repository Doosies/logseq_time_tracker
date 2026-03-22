# P1a-5: 기본 검증 (구조 검증 + 추론 근거)

## 목표

LLM 요약이 실제 diff와 일치하는지 rule-based로 검증한다. 1단계 구조 검증(팩트 대조)과 추론 근거 검증(`[추론된내용]` 태그의 근거가 diff에 존재하는지)을 구현한다.

---

## 선행 조건

- P1a-4 완료 — LLM 요약(CommitSummary) 생성 가능

---

## 참조 설계 문서

| 문서                 | 섹션                  | 참조 내용                                                                |
| -------------------- | --------------------- | ------------------------------------------------------------------------ |
| `04-verification.md` | §2-1 1단계: 구조 검증 | 검증 항목 테이블 (파일명, 함수명, 변경 방향, 규모, 추론 근거, 추론 분류) |
| `04-verification.md` | §2-1 구현 접근        | StructuralValidation, Violation 인터페이스                               |
| `04-verification.md` | §6 Phase별 검증 전략  | Phase 1a: 구조 검증 + 추론 근거 검증 필수                                |

---

## 생성/수정 파일 목록

| 파일                                               | 역할                                                 |
| -------------------------------------------------- | ---------------------------------------------------- |
| `src/processing/verifier.ts`                       | 구조 검증 + 추론 근거 검증 통합                      |
| `src/processing/validators/file_validator.ts`      | 요약에서 언급한 파일이 diff에 존재하는지             |
| `src/processing/validators/symbol_validator.ts`    | 요약에서 언급한 함수/클래스가 hunk 헤더에 존재하는지 |
| `src/processing/validators/inference_validator.ts` | `[추론된내용]` 태그의 근거가 diff에 존재하는지       |
| `src/types/verification.ts`                        | Violation, VerificationResult 타입                   |

---

## 구현 상세

### src/types/verification.ts

```typescript
export type ViolationType =
    | 'file_not_in_diff'
    | 'symbol_not_in_diff'
    | 'direction_mismatch'
    | 'scale_mismatch'
    | 'unsupported_inference'
    | 'business_speculation';

export interface Violation {
    type: ViolationType;
    detail: string;
    severity: 'error' | 'warning';
}

export interface VerificationResult {
    passed: boolean;
    violations: Violation[];
    confidence_score: number; // 0.0 ~ 1.0
    inference_validity: {
        total_inferences: number;
        valid_inferences: number;
        invalid_inferences: number;
    };
    verified_at: string;
}
```

### src/processing/validators/file_validator.ts

```typescript
import type { StructuredFacts } from '../../types/facts.js';
import type { CommitSummary } from '../../types/summary.js';
import type { Violation } from '../../types/verification.js';

const FILE_PATH_RE = /[\w\-./]+\.\w+/g;

export function validateFiles(summary: CommitSummary, facts: StructuredFacts): Violation[] {
    const violations: Violation[] = [];
    const diff_files = new Set(facts.files.map((f) => f.path));

    const mentioned_files = summary.what.match(FILE_PATH_RE) ?? [];
    for (const file of mentioned_files) {
        if (!diff_files.has(file) && !isPartialMatch(file, diff_files)) {
            violations.push({
                type: 'file_not_in_diff',
                detail: `요약에서 "${file}"을 언급했지만 diff에 없음`,
                severity: 'error',
            });
        }
    }

    return violations;
}

function isPartialMatch(mentioned: string, diff_files: Set<string>): boolean {
    return [...diff_files].some((f) => f.endsWith(mentioned) || mentioned.endsWith(f));
}
```

### src/processing/validators/symbol_validator.ts

```typescript
import type { StructuredFacts } from '../../types/facts.js';
import type { CommitSummary } from '../../types/summary.js';
import type { Violation } from '../../types/verification.js';

const SYMBOL_RE = /\b([A-Z]\w+|[a-z]\w+(?:(?:Error|Service|Controller|Handler|Manager|Factory|Provider)\b)|\w+\(\))/g;

export function validateSymbols(summary: CommitSummary, facts: StructuredFacts): Violation[] {
    const violations: Violation[] = [];
    const diff_symbols = new Set(facts.files.flatMap((f) => f.functions_modified));

    if (diff_symbols.size === 0) return []; // hunk 헤더에 심볼이 없으면 스킵

    const mentioned = summary.what.match(SYMBOL_RE) ?? [];
    for (const symbol of mentioned) {
        const clean = symbol.replace(/\(\)$/, '');
        if (clean.length < 3) continue; // 너무 짧은 것은 스킵
        if (!diff_symbols.has(clean) && !isCloseMatch(clean, diff_symbols)) {
            violations.push({
                type: 'symbol_not_in_diff',
                detail: `요약에서 "${clean}"을 언급했지만 diff hunk에 없음`,
                severity: 'warning',
            });
        }
    }

    return violations;
}

function isCloseMatch(symbol: string, diff_symbols: Set<string>): boolean {
    return [...diff_symbols].some((s) => s.toLowerCase() === symbol.toLowerCase());
}
```

### src/processing/validators/inference_validator.ts

```typescript
import type { CommitSummary } from '../../types/summary.js';
import type { Violation } from '../../types/verification.js';

const INFERENCE_TAG_RE = /\[추론된내용\](.*?)(?=\[추론된내용\]|$)/gs;
const BUSINESS_KEYWORDS = ['기획', '요청', '사용자 피드백', 'PM', '기획팀', '요구사항'];

export function validateInferences(summary: CommitSummary): {
    violations: Violation[];
    total: number;
    valid: number;
} {
    const violations: Violation[] = [];
    const inferences = [...summary.what.matchAll(INFERENCE_TAG_RE)];

    if (summary.reason_inferred && inferences.length === 0) {
        violations.push({
            type: 'unsupported_inference',
            detail: 'reason_inferred=true이지만 [추론된내용] 태그가 없음',
            severity: 'error',
        });
    }

    if (!summary.reason_inferred && inferences.length > 0) {
        violations.push({
            type: 'unsupported_inference',
            detail: 'reason_inferred=false이지만 [추론된내용] 태그가 존재',
            severity: 'error',
        });
    }

    for (const match of inferences) {
        const text = match[1]?.trim() ?? '';
        for (const keyword of BUSINESS_KEYWORDS) {
            if (text.includes(keyword)) {
                violations.push({
                    type: 'business_speculation',
                    detail: `추론에 비즈니스 추측 포함: "${keyword}"`,
                    severity: 'error',
                });
            }
        }
    }

    return {
        violations,
        total: inferences.length,
        valid: inferences.length - violations.filter((v) => v.severity === 'error').length,
    };
}
```

### src/processing/verifier.ts 핵심

```typescript
import type { StructuredFacts } from '../types/facts.js';
import type { CommitSummary } from '../types/summary.js';
import type { VerificationResult } from '../types/verification.js';
import { validateFiles } from './validators/file_validator.js';
import { validateSymbols } from './validators/symbol_validator.js';
import { validateInferences } from './validators/inference_validator.js';

export function verifyCommitSummary(summary: CommitSummary, facts: StructuredFacts): VerificationResult {
    const file_violations = validateFiles(summary, facts);
    const symbol_violations = validateSymbols(summary, facts);
    const { violations: inference_violations, total, valid } = validateInferences(summary);

    const all_violations = [...file_violations, ...symbol_violations, ...inference_violations];
    const errors = all_violations.filter((v) => v.severity === 'error');

    const base_score = errors.length === 0 ? 1.0 : 0.0;
    const warning_penalty = all_violations.filter((v) => v.severity === 'warning').length * 0.1;
    const confidence_score = Math.max(0, base_score - warning_penalty);

    return {
        passed: errors.length === 0,
        violations: all_violations,
        confidence_score,
        inference_validity: {
            total_inferences: total,
            valid_inferences: valid,
            invalid_inferences: total - valid,
        },
        verified_at: new Date().toISOString(),
    };
}
```

---

## 완료 기준

- [ ] 파일명 검증: diff에 없는 파일 언급 시 error 감지
- [ ] 심볼 검증: diff hunk에 없는 심볼 언급 시 warning 감지
- [ ] 추론 태그 검증: `[추론된내용]`과 `reason_inferred` 불일치 시 error
- [ ] 비즈니스 추측 검증: 비즈니스 키워드 포함 시 즉시 error
- [ ] confidence_score 계산이 error/warning에 따라 정확
- [ ] 검증 통과율 수동 확인 (10건 샘플)
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ P1a-6: ChromaDB 연동 (`P1a-6-chromadb.md`)
