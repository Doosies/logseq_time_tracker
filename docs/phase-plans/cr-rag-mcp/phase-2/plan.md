# Phase 2: GitLab 통합 + 중앙 벡터 DB

## 목표

GitLab REST/GraphQL API로 MR + 커밋 + 디스커션을 수집하고, MR 단위 요약 파이프라인을 추가한다. 벡터 DB를 ChromaDB에서 Qdrant(서버 모드)로 마이그레이션하여 팀 데이터 공유 기반을 마련한다. 검증 파이프라인을 2단계(의미 일관성 검증)로 강화한다.

---

## 선행 조건 (ROI 게이트)

- Phase 1b 완료 및 안정 운영
- **단일 프로젝트 안정 운영, 팀 확장 필요성 확인**

---

## 참조 설계 문서 (섹션 단위 매핑)

| 문서                  | 섹션                          | 참조 내용                             |
| --------------------- | ----------------------------- | ------------------------------------- |
| `02-data-pipeline.md` | §2-2 Phase 2: GitLab API 기반 | REST 엔드포인트 테이블, Rate Limiting |
| `02-data-pipeline.md` | §3-0-5 MR이 있는 경우         | MR 포함 커밋 그룹핑 제외 규칙         |
| `03-data-model.md`    | §2-2 MRDocument               | MR 스키마 (content + metadata)        |
| `04-verification.md`  | §2-2 의미 일관성 검증         | LLM 기반 cross-validation             |
| `04-verification.md`  | §2-3 신뢰도 점수 산출         | 임계값 튜닝 전략                      |
| `06-tech-stack.md`    | §2-3 Qdrant                   | 서버 모드, hybrid search, Docker      |
| `01-architecture.md`  | §4 Phase 2 배포               | Qdrant 서버 분리, GitLab API 연동     |

---

## 마일스톤 요약

| #    | 마일스톤              | 산출물                               | 완료 기준                                |
| ---- | --------------------- | ------------------------------------ | ---------------------------------------- |
| P2-1 | GitLab API 클라이언트 | REST API 연동 모듈 (@gitbeaker/rest) | MR 목록, 커밋, diff, 디스커션 수집       |
| P2-2 | MR 데이터 처리        | MR 요약 파이프라인                   | MR 목적 + 디스커션 요약, MRDocument 생성 |
| P2-3 | 의미 일관성 검증      | 2단계 검증 추가                      | LLM cross-validation 동작, 정확도 향상   |
| P2-4 | 신뢰도 점수 튜닝      | 임계값 최적화                        | Phase 1a/1b 데이터 기반 임계값 조정      |
| P2-5 | Qdrant 마이그레이션   | ChromaDB → Qdrant                    | 기존 데이터 무손실 이전                  |
| P2-6 | 멀티 프로젝트         | project_id 기반 분리                 | 여러 프로젝트 동시 인덱싱/검색           |
| P2-7 | 설정 파일 구조 분석   | Registry 패턴 계층 2                 | 라우터/스토어 설정 파일 AST 파싱         |

---

## 기술 스택 변경 (Phase 1a 대비)

```diff
  Node.js >= 20 + TypeScript
  ├── @modelcontextprotocol/sdk (stdio)
- ├── chromadb (embedded)
+ ├── @qdrant/js-client-rest (Qdrant 서버)
  ├── simple-git
+ ├── @gitbeaker/rest (GitLab API)
  ├── OpenAI API (GPT-4o-mini + text-embedding-3-small)
  ├── typescript (Compiler API)
- └── JSON 파일 (메타데이터)
+ └── better-sqlite3 (메타데이터)
```

---

## 생성/수정 파일 목록 (예상)

| 파일                                              | 역할                           |
| ------------------------------------------------- | ------------------------------ |
| `src/collection/gitlab_client.ts`                 | GitLab REST API 래퍼           |
| `src/processing/mr_summarizer.ts`                 | MR 요약 파이프라인             |
| `src/processing/validators/semantic_validator.ts` | 2단계 의미 일관성 검증         |
| `src/storage/vector_db_qdrant.ts`                 | Qdrant 클라이언트              |
| `src/storage/meta_store_sqlite.ts`                | SQLite 메타데이터 스토어       |
| `src/storage/migration.ts`                        | ChromaDB → Qdrant 마이그레이션 |

---

## 구현 상세

> Phase 1a에서 확립된 패턴(에러 처리, 설정 로드, 파이프라인 오케스트레이션)을 따름.
> 상세 구현은 Phase 2 시작 시 마일스톤별 문서로 작성.

---

## 검증 기준

- [ ] GitLab 프로젝트에서 MR + 커밋 일괄 인제스트 성공
- [ ] 검증 통과율 85% 이상 (1+2단계)
- [ ] 멀티 프로젝트 검색 동작
- [ ] Qdrant에서 검색 응답 시간 500ms 이내
- [ ] ChromaDB → Qdrant 마이그레이션 무손실

---

## 다음 단계

→ Phase 3: 팀 공유 서버 (`../phase-3/plan.md`)
