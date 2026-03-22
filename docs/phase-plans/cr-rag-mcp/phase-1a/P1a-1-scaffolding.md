# P1a-1: 패키지 Scaffolding

## 목표

모노레포 내에 `packages/cr-rag-mcp` 패키지를 생성하고, 빌드/타입 체크가 통과하는 최소 프로젝트 구조를 확립한다.

---

## 선행 조건

- 모노레포 환경 정상 동작 (pnpm workspace + turbo)

---

## 참조 설계 문서

| 문서                 | 섹션           | 참조 내용                            |
| -------------------- | -------------- | ------------------------------------ |
| `01-architecture.md` | §5 패키지 구조 | 전체 디렉토리 트리, 모듈별 파일 배치 |
| `06-tech-stack.md`   | §1 개요 테이블 | Phase 1a 기술 스택 목록              |
| `07-roadmap.md`      | §2-4 기술 스택 | 의존성 트리 구조                     |

---

## 생성 파일 목록

### `packages/cr-rag-mcp/`

| 파일              | 역할                                       |
| ----------------- | ------------------------------------------ |
| `package.json`    | `@personal/cr-rag-mcp`, 의존성, scripts    |
| `tsconfig.json`   | TypeScript 설정 (config/ 확장)             |
| `src/index.ts`    | MCP 서버 엔트리포인트 (placeholder)        |
| `src/server/`     | MCP 서버 설정, 핸들러 라우팅 (빈 디렉토리) |
| `src/tools/`      | MCP Tools 구현 (빈 디렉토리)               |
| `src/resources/`  | MCP Resources 구현 (빈 디렉토리)           |
| `src/collection/` | Data Collection Layer (빈 디렉토리)        |
| `src/processing/` | Data Processing Layer (빈 디렉토리)        |
| `src/storage/`    | Storage Layer (빈 디렉토리)                |
| `src/search/`     | 검색 엔진 (빈 디렉토리)                    |
| `src/types/`      | 공유 타입 정의 (빈 디렉토리)               |
| `src/config/`     | 설정 로더 (빈 디렉토리)                    |

### 워크스페이스 설정

| 파일                  | 변경 내용                                         |
| --------------------- | ------------------------------------------------- |
| `pnpm-workspace.yaml` | catalog에 `chromadb`, `simple-git`, `openai` 추가 |

---

## 구현 상세

### package.json 핵심

```json
{
    "name": "@personal/cr-rag-mcp",
    "version": "0.0.1",
    "type": "module",
    "main": "dist/index.js",
    "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js",
        "type-check": "tsc --noEmit",
        "lint": "eslint . --ext ts",
        "format": "prettier --write \"src/**/*.ts\""
    },
    "dependencies": {
        "@modelcontextprotocol/sdk": "catalog:",
        "chromadb": "catalog:",
        "simple-git": "catalog:",
        "openai": "catalog:"
    },
    "devDependencies": {
        "tsx": "catalog:",
        "typescript": "catalog:"
    }
}
```

### tsconfig.json 핵심

```json
{
    "extends": "../../config/tsconfig.base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "target": "ES2022"
    },
    "include": ["src"]
}
```

### src/index.ts (placeholder)

```typescript
#!/usr/bin/env node

// MCP 서버 엔트리포인트 — P1a-8에서 구현
console.log('cr-rag-mcp server placeholder');
```

### 디렉토리 구조 (01-architecture.md §5 기반)

```
packages/cr-rag-mcp/
├── src/
│   ├── index.ts                 # MCP 서버 엔트리포인트
│   ├── server/                  # MCP 서버 설정, 핸들러 라우팅
│   ├── tools/                   # MCP Tools 구현
│   ├── resources/               # MCP Resources 구현
│   ├── collection/              # Data Collection Layer
│   │   └── git_cli.ts           # Git CLI 래퍼 (P1a-2)
│   ├── processing/              # Data Processing Layer
│   │   ├── extractor.ts         # 구조화 팩트 추출 (P1a-3)
│   │   ├── summarizer.ts        # LLM 요약 생성 (P1a-4)
│   │   ├── verifier.ts          # 할루시네이션 검증 (P1a-5)
│   │   └── embedder.ts          # 임베딩 생성 (P1a-6)
│   ├── storage/                 # Storage Layer
│   │   ├── vector_db.ts         # Vector DB 클라이언트 (P1a-6)
│   │   └── meta_store.ts        # 메타데이터 스토어 (P1a-6)
│   ├── search/                  # 검색 엔진
│   │   ├── engine.ts            # 유사도 검색 (P1a-6)
│   │   └── post_processor.ts    # 후처리 (P1a-7)
│   ├── types/                   # 공유 타입 정의
│   └── config/                  # 설정 로더
├── package.json
└── tsconfig.json
```

---

## 완료 기준

- [ ] `pnpm install --no-offline` 성공
- [ ] `pnpm type-check --filter @personal/cr-rag-mcp` 성공
- [ ] `pnpm build --filter @personal/cr-rag-mcp` 성공
- [ ] turbo 의존성 그래프에 `@personal/cr-rag-mcp` 등록
- [ ] 디렉토리 구조가 01-architecture.md §5와 일치

---

## 다음 단계

→ P1a-2: Git CLI 수집기 (`P1a-2-git-cli.md`)
