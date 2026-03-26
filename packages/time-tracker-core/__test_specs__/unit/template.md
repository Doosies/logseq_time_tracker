# Template 서비스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 2.10 TemplateService (Phase 4)

#### UC-TMPL-001: 템플릿 CRUD 기본 동작

- **Given**: TemplateService가 초기화되어 있다
- **When**: 템플릿을 생성 → 조회 → 수정 → 삭제한다
- **Then**: 각 단계에서 정상 동작하고, 삭제 후 조회 시 null을 반환한다
- **Phase**: 4
- **테스트 레벨**: 단위

#### UC-TMPL-002: 플레이스홀더 치환

- **Given**: `"## {{job_title}} 작업 보고"` 내용의 템플릿이 존재한다
- **When**: renderTemplate(template_id, { job_title: "API 개발" })을 호출한다
- **Then**: `"## API 개발 작업 보고"` 문자열이 반환된다
- **Phase**: 4
- **테스트 레벨**: 단위

#### UC-TMPL-003: XSS 방지 - 위험 태그 필터링

- **Given**: 템플릿이 존재한다
- **When**: renderTemplate에 `{ job_title: "<script>alert('xss')</script>" }` 값을 전달한다
- **Then**: `<script>` 태그가 이스케이프 처리되어 `&lt;script&gt;` 형태로 반환된다
- **Phase**: 4
- **테스트 레벨**: 단위

#### UC-TMPL-004: 존재하지 않는 플레이스홀더 키 처리

- **Given**: `"{{job_title}} - {{unknown_field}}"` 내용의 템플릿이 존재한다
- **When**: renderTemplate(template_id, { job_title: "테스트" })을 호출한다 (unknown_field 미제공)
- **Then**: 존재하지 않는 플레이스홀더는 빈 문자열로 치환되거나 원본 유지되며, 에러는 발생하지 않는다
- **Phase**: 4
- **테스트 레벨**: 단위
