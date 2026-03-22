# 에이전트 시스템 일반화 최종 보고서

- **사이클**: 2026-03-22-001
- **유형**: Refactor
- **상태**: 완료

---

## 1. 작업 요약

에이전트 시스템을 **범용 코어(Core) + 프로젝트 스택 스킬(Stack Skills)** 2계층 구조로 분리하여, 새 프로젝트(Git RAG MCP 등)에서 동일한 에이전트 시스템을 즉시 재사용할 수 있도록 일반화했습니다.

## 2. 변경 범위

### 수정된 파일 (8개)

| 파일                                           | 변경 내용                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `.cursor/agents/developer.md`                  | 스택 특화 섹션(Svelte/React/Chrome/pnpm) 추출, 범용 참조로 교체  |
| `.cursor/agents/qa.md`                         | 스택 특화 섹션(Vitest/Storybook/Svelte) 추출, 범용 참조로 교체   |
| `.cursor/rules/main-orchestrator.mdc`          | pnpm/Storybook/.svelte 하드코딩 파라미터화 + 설정 참조 순서 추가 |
| `AGENTS.md`                                    | 스택 참조 추상화 (Chore 대상, 도메인 워크플로우 등)              |
| `.cursor/workflows/plan-execution-workflow.md` | 조건부 스킬 참조로 변경 (스택 스킬 직접 나열 제거)               |
| `.cursor/skills/developer/SKILL.md`            | description 범용화                                               |
| `.cursor/skills/qa/SKILL.md`                   | description 범용화                                               |
| `.cursor/skills/project-conventions/SKILL.md`  | 테스트 로케일 절 추가                                            |

### 신규 생성 파일 (19개)

| 디렉토리                                 | 파일                                                          |
| ---------------------------------------- | ------------------------------------------------------------- |
| `.cursor/skills/stack/svelte/`           | SKILL.md, conventions.md, testing.md, workflows.md            |
| `.cursor/skills/stack/react/`            | SKILL.md, conventions.md, testing.md                          |
| `.cursor/skills/stack/chrome-extension/` | SKILL.md, conventions.md, testing.md                          |
| `.cursor/skills/stack/storybook/`        | SKILL.md, conventions.md, testing.md                          |
| `.cursor/skills/stack/pnpm-monorepo/`    | SKILL.md, conventions.md                                      |
| 루트                                     | .cursor-agent-config.yaml, .cursor-agent-config.template.yaml |

## 3. 아키텍처 변경

### Before

```
에이전트(developer.md) → 스택 특화 내용 직접 포함
에이전트(qa.md) → 스택 특화 내용 직접 포함
main-orchestrator → pnpm/Storybook 하드코딩
```

### After

```
에이전트(developer.md) → 범용 Core만 포함 → skills/stack/*/conventions.md 참조
에이전트(qa.md) → 범용 Core만 포함 → skills/stack/*/testing.md 참조
main-orchestrator → .cursor-agent-config.yaml 기반 파라미터 참조
.cursor-agent-config.yaml → 프로젝트별 설정 (스크립트, 스택, 로케일)
```

### 설정 폴백 체인

```
.cursor-agent-config.yaml → AGENTS.md → project-conventions → package.json scripts
```

## 4. 품질 검증 결과

| 검증 단계                         | 결과                    |
| --------------------------------- | ----------------------- |
| developer.md 추출 후 회귀 검증    | PASS (재시도 1회 후)    |
| qa.md 추출 후 회귀 검증           | PASS (재시도 1회 후)    |
| main-orchestrator 파라미터화 검증 | PASS                    |
| Core 분리 통합 회귀 검증          | PASS                    |
| Stack Skills 통합 회귀 검증       | PASS                    |
| 최종 전체 회귀 검증               | PASS (경로 수정 1건 후) |

### 최종 검증 8개 항목

1. 에이전트 참조 체인: **PASS**
2. 품질 게이트 구조: **PASS**
3. 워크플로우 패턴 (6종): **PASS**
4. 위임 규칙: **PASS**
5. SKILL.md 정합성: **PASS**
6. plan-execution 0~10단계: **PASS**
7. 프로젝트 레이어 독립성: **PASS**
8. config 유효성: **PASS**

## 5. 주요 결정사항

| 결정                                   | 근거                                        |
| -------------------------------------- | ------------------------------------------- |
| 기존 references 파일 유지 (삭제 안 함) | 참조 체인 깨뜨리지 않고 점진적 마이그레이션 |
| 폴백 체인 4단계                        | config 없는 프로젝트에서도 정상 동작 보장   |
| 직렬 실행 + 단계별 검증                | 고위험 구조 변경의 안전성 확보              |
| 변경 이력 미수정                       | 역사적 기록 보존                            |

## 6. 발견된 이슈 및 해결

| 이슈                         | 해결                                    | 영향도         |
| ---------------------------- | --------------------------------------- | -------------- |
| developer.md 1차 추출 불완전 | 재호출 후 키워드 완전 제거              | minor          |
| qa.md 1차 추출 불완전        | 재호출 후 키워드 제거 + 파이프라인 추가 | minor          |
| 폴백 체인 경로 불일치        | 1줄 경로 수정                           | minor          |
| git stash 사고               | fsck --dangling으로 복구                | major (일시적) |

## 7. 후속 작업

- [ ] 새 레포(Git RAG MCP)에서 `.cursor-agent-config.template.yaml` 기반으로 에이전트 시스템 적용
- [ ] ecount-dev-tool type-check/build 기존 오류 수정 (별도 세션)
- [ ] AGENTS.md 워크플로우 다이어그램과 main-orchestrator 표현 통일 (선택적)
