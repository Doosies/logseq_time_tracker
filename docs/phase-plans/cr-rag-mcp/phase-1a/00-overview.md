# Phase 1a: MVP + 핵심 가정 검증

## 목표

최소한의 기능으로 동작하는 CR-RAG MCP 서버를 구축한다. 로컬 Git 리포에서 커밋을 수집하고, LLM으로 요약 + 검증한 뒤, ChromaDB에 인덱싱하여 Cursor에서 `search_review_context`로 과거 변경을 검색할 수 있음을 확인한다.

P1a-6(ChromaDB 연동) 완료 후 **검증 게이트**를 두어, 임베딩 검색이 실제로 유용한 결과를 반환하는지 50건 인제스트 + 5건 시뮬레이션으로 검증한다.

---

## 선행 조건

- 모노레포 환경 정상 동작 (pnpm workspace + turbo)
- OpenAI API 키 확보 (GPT-4o-mini + text-embedding-3-small)
- 대상 Git 리포지토리 100+ 커밋 존재

---

## 기술 스택

```
Node.js >= 20 + TypeScript
├── @modelcontextprotocol/sdk (stdio)
├── chromadb (embedded)
├── simple-git (Git CLI 래퍼)
├── OpenAI API (GPT-4o-mini + text-embedding-3-small)
└── JSON 파일 (메타데이터)
```

---

## 마일스톤 순서

| #      | 마일스톤              | 문서                       |
| ------ | --------------------- | -------------------------- |
| P1a-1  | 패키지 scaffolding    | `P1a-1-scaffolding.md`     |
| P1a-2  | Git CLI 수집기        | `P1a-2-git-cli.md`         |
| P1a-3  | 구조화 팩트 추출      | `P1a-3-fact-extraction.md` |
| P1a-4  | LLM 요약 + 추론 태깅  | `P1a-4-llm-summary.md`     |
| P1a-5  | 기본 검증             | `P1a-5-verification.md`    |
| P1a-6  | ChromaDB 연동         | `P1a-6-chromadb.md`        |
| **--** | **검증 게이트**       | `P1a-gate-validation.md`   |
| P1a-7  | 후처리 (기본)         | `P1a-7-post-processing.md` |
| P1a-8  | MCP 서버 + 기본 Tools | `P1a-8-mcp-server.md`      |
| P1a-9  | E2E 검증              | `P1a-9-e2e-validation.md`  |

---

## 구현 범위

**포함**:

- `search_review_context` Tool (기본 후처리 적용)
- `ingest_commits` Tool (bulk, incremental)
- `supplement_reason` Tool
- `project://overview` Resource
- Diff 크기 게이트 (소/중/대)
- 구조 검증 (1단계, 추론 근거 검증 포함)
- ChromaDB embedded
- JSON 파일 기반 Metadata Store
- OpenAI API (GPT-4o-mini + text-embedding-3-small)
- hunk 헤더 파싱 (L1~L2)
- 콜드 스타트 처리
- `[추론된내용]` 태그 시스템

**제외 (Phase 1b로 이연)**:

- TypeScript Compiler API (L3~L4)
- 커밋 그룹핑 (Logical Change Unit)
- 코드 구조 스냅샷 (ArchitectureDocument)
- FileHistoryDocument
- `get_file_history`, `search_by_topic`, `get_impact_analysis`, `analyze_architecture` Tools
- `project://hot-files`, `project://recent-issues` Resources
- 맥락 조합 (후처리 강화)
- Registry 패턴 추적

---

## 검증 게이트 (P1a-6 완료 후)

P1a-6까지 완료되면 파이프라인이 "수집 → 요약 → 검증 → 임베딩"까지 동작한다. 이 시점에서 50건 자동 인제스트 → 5건 시뮬레이션으로 유용성을 검증한다.

| 결과 | 유용성 비율 | 조치                                         |
| ---- | ----------- | -------------------------------------------- |
| 통과 | >= 60%      | 나머지 Phase 1a 진행 (P1a-7~9)               |
| 보류 | 40~60%      | 프롬프트/임베딩 모델 변경 후 재시도          |
| 실패 | < 40%       | 접근 방식 재검토 (RAG 대신 직접 Git 분석 등) |

---

## 최종 완료 기준

- [ ] 로컬 Git 리포에서 최근 100개 커밋 인제스트 성공
- [ ] 검증 통과율 80% 이상
- [ ] Cursor에서 `search_review_context` 호출 시 관련 히스토리 반환
- [ ] 검색 결과가 실제로 유용한지 수동 평가 (10건 샘플, 60%+ 유용)
- [ ] MCP 서버 시작~응답 시간 3초 이내
- [ ] `[추론된내용]` 태그가 정확히 분류되는지 검증 (추론 vs 사실)

---

## 다음 단계

→ Phase 1b: 확장 (`phase-1b/plan.md`) — AST 분석, 커밋 그룹핑, 코드 구조 스냅샷
