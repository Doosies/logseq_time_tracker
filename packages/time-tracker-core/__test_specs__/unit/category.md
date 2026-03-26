# Category 서비스 (순환 참조 포함) 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 2.4 CategoryService

#### UC-CAT-001: 기본 카테고리 시드 생성

- **Given**: 빈 CategoryRepository
- **When**: CategoryService.seedDefaults()를 호출한다
- **Then**: "개발", "분석", "회의", "기타" 4개의 카테고리가 생성되고, 각각 sort_order가 1~4로 설정된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-CAT-002: 카테고리 트리 깊이 10 제한

- **Given**: 깊이 9인 Category 체인이 존재한다
- **When**: 깊이 10으로 새 카테고리를 생성한다
- **Then**: 성공한다
- **And When**: 깊이 11로 생성을 시도한다
- **Then**: ValidationError가 발생한다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-CAT-003: 카테고리 비활성화

- **Given**: "개발" 카테고리가 활성 상태이다
- **When**: is_active를 false로 변경한다
- **Then**: 카테고리 조회 시 is_active: false로 반환되고, 셀렉터 UI용 활성 카테고리 목록에서 제외된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-CAT-004: 카테고리 정렬 순서 변경

- **Given**: "개발"(sort_order: 1), "분석"(sort_order: 2), "회의"(sort_order: 3) 카테고리가 존재한다
- **When**: "회의"의 sort_order를 1로 변경한다
- **Then**: getCategories()가 sort_order 기준으로 정렬된 목록을 반환한다
- **Phase**: 1
- **테스트 레벨**: 단위


### 11.4 Category 순환 참조 검증

#### UC-CATEGORY-CYCLE-001: 카테고리 이동 시 순환 참조 방지

- **Given**: 카테고리 A → B → C 트리가 존재한다
- **When**: 카테고리 A의 parent_id를 C로 변경 시도한다
- **Then**: `ValidationError("순환 참조가 감지되었습니다")`가 발생하고, 카테고리 구조는 변경되지 않는다
- **Phase**: 1
- **테스트 레벨**: 단위
