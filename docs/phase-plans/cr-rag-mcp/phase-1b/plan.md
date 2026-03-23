# Phase 1b: 확장

## 목표

Phase 1a에서 검증된 MVP를 확장한다. TypeScript Compiler API로 정밀한 코드 구조 분석(L3~L4), 커밋 그룹핑, 코드 구조 스냅샷(ArchitectureDocument), FileHistoryDocument를 추가하고, 4개 Tool + 2개 Resource를 확장한다.

---

## 선행 조건 (ROI 게이트)

- Phase 1a 완료 및 E2E 검증 통과
- **2주 실사용, 주 1회 이상 유용한 컨텍스트 제공** 확인

---

## 참조 설계 문서 (섹션 단위 매핑)

| 문서                  | 섹션                           | 참조 내용                                       |
| --------------------- | ------------------------------ | ----------------------------------------------- |
| `02-data-pipeline.md` | §3 커밋 그룹핑                 | LogicalChangeUnit(메타만), 그룹핑 알고리즘, `CommitDocumentMetadata` 그룹 필드 |
| `02-data-pipeline.md` | §4-3 코드 구조 추출 L3~L4      | SymbolDetail, TypeScript Compiler API 활용      |
| `02-data-pipeline.md` | §8 코드 구조 스냅샷 파이프라인 | ArchitectureDocument 생성 트리거, 절차          |
| `02-data-pipeline.md` | §9-4 맥락 조합                 | 동일 파일 변경 스토리 구성                      |
| `03-data-model.md`    | §2-3 FileHistoryDocument       | 스키마, 생성/갱신 전략                          |
| `03-data-model.md`    | §2-4 ArchitectureDocument      | 스키마, snapshot_at, conventions                |
| `05-mcp-interface.md` | §2-2 get_file_history          | 입출력 스키마                                   |
| `05-mcp-interface.md` | §2-3 search_by_topic           | 입출력 스키마                                   |
| `05-mcp-interface.md` | §2-4 get_impact_analysis       | 입출력 스키마, import 관계                      |
| `05-mcp-interface.md` | §2-7 analyze_architecture      | 입출력 스키마                                   |
| `05-mcp-interface.md` | §3-2 project://hot-files       | Resource 스키마                                 |
| `05-mcp-interface.md` | §3-3 project://recent-issues   | Resource 스키마                                 |
| `04-verification.md`  | §2-2 의미 일관성 검증          | 2단계 검증 (Phase 1b에서 추가)                  |

---

## 마일스톤 요약

| #     | 마일스톤                | 산출물                       | 완료 기준                            |
| ----- | ----------------------- | ---------------------------- | ------------------------------------ |
| P1b-1 | TypeScript Compiler API | AST 분석 모듈 (L3~L4)        | 시그니처, 의존성 관계 추출           |
| P1b-2 | 커밋 그룹핑             | 커밋 그룹 감지 + 메타데이터 부여 모듈 | 연속 커밋 자동 그룹핑, `group_id` / `group_size` / `group_index` 메타데이터 부여 |
| P1b-3 | 코드 구조 스냅샷        | ArchitectureDocument 생성    | 핵심 인터페이스/베이스 클래스 인덱싱 |
| P1b-4 | FileHistoryDocument     | 파일별 히스토리 요약 생성    | 파일 변천사 요약, 갱신 파이프라인    |
| P1b-5 | 후처리 강화             | 맥락 조합 (동일 파일 스토리) | 시간순 변경 스토리 생성              |
| P1b-6 | 추가 Tools + Resources  | 4개 Tool + 2개 Resource      | Cursor에서 모든 Tool 동작            |

---

## 생성/수정 파일 목록 (예상)

| 파일                                     | 역할                                  |
| ---------------------------------------- | ------------------------------------- |
| `src/processing/code_analyzer.ts`        | TypeScript Compiler API 기반 AST 분석 |
| `src/processing/grouper.ts`              | 그룹 감지 + 커밋별 `group_*` 메타데이터 부여 |
| `src/processing/architecture_builder.ts` | ArchitectureDocument 생성             |
| `src/processing/file_history_builder.ts` | FileHistoryDocument 생성/갱신         |
| `src/search/post_processor.ts`           | 맥락 조합 추가 (기존 확장)            |
| `src/tools/get_file_history.ts`          | get_file_history Tool                 |
| `src/tools/search_by_topic.ts`           | search_by_topic Tool                  |
| `src/tools/get_impact_analysis.ts`       | get_impact_analysis Tool              |
| `src/tools/analyze_architecture.ts`      | analyze_architecture Tool             |
| `src/resources/hot_files.ts`             | project://hot-files Resource          |
| `src/resources/recent_issues.ts`         | project://recent-issues Resource      |

---

## 구현 상세

> Phase 1a에서 확립된 패턴을 따름. 상세 구현은 Phase 1b 시작 시 마일스톤별 문서로 작성.

핵심 인터페이스/타입만 정의:

- `LogicalChangeUnit`(개념 타입) / `GroupInfo` — `02-data-pipeline.md` §3
- `SymbolDetail` — `02-data-pipeline.md` §4-3
- `ArchitectureDocument` — `03-data-model.md` §2-4
- `FileHistoryDocument` — `03-data-model.md` §2-3

---

## 검증 기준

- [ ] AST 분석으로 시그니처/의존성 정확도 90%+
- [ ] 메타데이터 그룹핑(`group_id` 등)이 실제 작업 단위와 일치하는지 수동 평가 (70%+)
- [ ] ArchitectureDocument가 아키텍처 일관성 리뷰에 유용한지 평가
- [ ] FileHistoryDocument가 파일 맥락 파악에 유용한지 평가
- [ ] 맥락 조합 결과가 시간순 변경 스토리로서 가치 있는지 평가

---

## 다음 단계

→ Phase 2: GitLab 통합 + 중앙 벡터 DB (`../phase-2/plan.md`)
