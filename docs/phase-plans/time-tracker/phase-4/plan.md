# Phase 4: 잡 생성 & 템플릿

## 목표

Logseq 페이지 기반 Job 생성 워크플로우, 템플릿 엔진, Logseq 페이지 자동 생성, 알림/리마인더를 구현합니다.

---

## 선행 조건

- Phase 3 완료 — 전체 UI + 커스텀 필드 동작

---

## 참조 설계 문서

| 문서                  | 섹션                    | 참조 내용                                                       |
| --------------------- | ----------------------- | --------------------------------------------------------------- |
| `06-ui-ux.md`         | §잡 생성 플로우         | Step-by-step 위저드 (정보 입력 → 카테고리 선택 → 템플릿 → 확인) |
| `06-ui-ux.md`         | §템플릿 시스템          | 템플릿 관리 UI, placeholder 치환                                |
| `06-ui-ux.md`         | §알림 & 리마인더        | 데스크톱 알림, 주기적 리마인더                                  |
| `06-ui-ux.md`         | §페이지→Job 매핑 플로우 | 기존 Logseq 페이지에서 Job 생성                                 |
| `02-architecture.md`  | §4.10 TemplateService   | 템플릿 CRUD, placeholder 치환, 페이지 생성                      |
| `02-architecture.md`  | §10 Logseq 통신         | logseq.Editor API, 페이지 생성/수정                             |
| `03-data-model.md`    | §JobTemplate            | template_content, placeholders JSON                             |
| `01-requirements.md`  | FR-8                    | 템플릿 기능                                                     |
| `01-requirements.md`  | FR-10                   | 알림/리마인더                                                   |
| `08-test-usecases.md` | §Phase 4 유즈케이스     | 템플릿 치환, 페이지 생성                                        |
| `09-user-flows.md`    | UF-15 ~ UF-17           | 잡 생성 위저드, 템플릿 사용, 알림 설정                          |

---

## 서브 단계

### 4A: Job 생성 위저드

| 컴포넌트                   | 역할                                           |
| -------------------------- | ---------------------------------------------- |
| `JobCreationWizard.svelte` | 3단계 위저드 컨테이너                          |
| `StepJobInfo.svelte`       | 1단계: title, description, 커스텀 필드         |
| `StepCategory.svelte`      | 2단계: 카테고리 선택 (CategorySelector 재사용) |
| `StepTemplate.svelte`      | 3단계: 템플릿 선택 + 미리보기 (선택사항)       |
| `StepConfirm.svelte`       | 최종 확인 + Logseq 페이지 생성 옵션            |

**위저드 동작**:

1. 정보 입력 → validation
2. 카테고리 선택 → JobCategory 매핑
3. 템플릿 선택 (옵션) → placeholder 입력
4. 확인 → Job 생성 + (선택 시) Logseq 페이지 생성

### 4B: TemplateService

| 파일                                                    | 역할                                       |
| ------------------------------------------------------- | ------------------------------------------ |
| `services/template_service.ts`                          | 템플릿 CRUD, placeholder 치환, 페이지 생성 |
| `adapters/storage/sqlite/sqlite_template_repository.ts` | SQL 기반 템플릿 저장                       |

**핵심 메서드**:

```typescript
interface ITemplateService {
    getTemplates(): Promise<JobTemplate[]>;
    getTemplateById(id: string): Promise<JobTemplate | null>;
    createTemplate(params: CreateTemplateParams): Promise<JobTemplate>;
    updateTemplate(id: string, updates: Partial<JobTemplate>): Promise<JobTemplate>;
    deleteTemplate(id: string): Promise<void>;
    renderTemplate(template_id: string, values: Record<string, string>): string;
    createLogseqPage(job: Job, rendered_content: string): Promise<void>;
}
```

**placeholder 치환**:

- 형식: `{{placeholder_name}}`
- `renderTemplate()`: template_content 내 `{{key}}`를 values[key]로 치환
- XSS 방지: `DOMPurify.sanitize(rendered_content)` 적용 (02-architecture.md §4.11)

**Logseq 페이지 생성**:

- `logseq.Editor.createPage(title, properties, { format: 'markdown' })`
- properties: job_id, category, status 등 메타데이터
- 내용: renderTemplate 결과

### 4C: 페이지→Job 매핑

| 파일                                  | 역할                          |
| ------------------------------------- | ----------------------------- |
| `services/page_mapping_service.ts`    | Logseq 페이지 → Job 매핑 관리 |
| `components/PageMappingDialog.svelte` | 기존 페이지에서 Job 생성 UI   |

**매핑 플로우** (06-ui-ux.md §페이지→Job 매핑 플로우):

1. Logseq 페이지에서 슬래시 커맨드 `/time-tracker-map`
2. PageMappingDialog 오픈 — 현재 페이지 정보 표시
3. Job 생성 + ExternalRef (system: 'logseq', value: page_uuid) 등록
4. 향후 해당 페이지에서 자동으로 Job 연동

### 4D: 알림 & 리마인더

| 파일                                     | 역할                            |
| ---------------------------------------- | ------------------------------- |
| `services/notification_service.ts`       | 데스크톱 알림 + 주기적 리마인더 |
| `components/NotificationSettings.svelte` | 알림 설정 UI                    |

**알림 유형**:

- 타이머 장시간 실행 경고 (설정 가능 — 기본 2시간)
- 주기적 리마인더 (설정 가능 — 기본 30분)
- 일일 요약 알림 (선택)

**구현**: `Notification API` + `setInterval` 주기 체크

### 4E: 테스트

| 테스트                          | 범위                                          |
| ------------------------------- | --------------------------------------------- |
| TemplateService 단위 테스트     | CRUD, placeholder 치환, XSS 방지              |
| Logseq 페이지 생성 통합 테스트  | renderTemplate → createPage (mock logseq API) |
| Job 생성 위저드 컴포넌트 테스트 | 단계별 진행, validation                       |
| 페이지 매핑 단위 테스트         | ExternalRef 생성 + 조회                       |
| 알림 서비스 단위 테스트         | 리마인더 스케줄, 알림 표시                    |

---

## 완료 기준

- [ ] Job 생성 위저드 (4단계) 구현
- [ ] TemplateService: CRUD + placeholder 치환 + XSS 방지
- [ ] Logseq 페이지 자동 생성 (renderTemplate → createPage)
- [ ] 페이지→Job 매핑 (ExternalRef 기반)
- [ ] 알림/리마인더 (Notification API)
- [ ] 전체 테스트 통과 + 커버리지 80%+

---

## 다음 단계

→ Phase 5: 통계 & 정리 (`phase-5/plan.md`)
