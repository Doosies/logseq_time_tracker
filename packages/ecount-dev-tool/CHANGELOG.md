# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [2.2.0] - 2026-02-06

### Added
- Quick Login 기능 추가
  - `loginDict`에 등록된 회사코드/아이디/비밀번호로 빠른 로그인
  - 동적 버튼 생성 및 자동 로그인 정보 입력
- EC Server Manager 기능 추가
  - V5 Server 선택 (lxba1~lxba10) 및 직접 입력 지원
  - V3 Server 선택 (ba1~ba3) 및 직접 입력 지원
  - Zeus 서버 (zeus01~) 지원
  - Test 서버 지원
  - 셀렉트 박스와 텍스트 입력 방식 전환 기능
- Local Server Buttons 추가
  - 5.0 로컬: `test.ecount.com:5001`로 전환
  - 3.0 로컬: `__v3domains=test` 파라미터 추가
  - devMode: `__disableMin=Y` 또는 `-dev` 서버로 전환
- Stage Server Manager 추가
  - stageba ↔ stagelxba2 간 원클릭 전환
  - URL에 따른 UI 자동 표시/숨김
- URL 기반 UI 동적 변경 기능
  - Stage 서버 감지 시 Stage Server Manager만 표시
  - 일반 서버에서는 EC Server Manager 표시
  - 탭 변경 시 자동 업데이트

### Changed
- Manifest V3 형식으로 업그레이드
- Chrome Extension API 최신 버전 사용

### Fixed
- 지원되지 않는 환경에서 알림 표시

---

## [2.3.0] - 2026-02-24

### Changed
- **UI 전면 리디자인**
  - 라이트 테마 색상을 차분한 다크 블루 계열로 변경 (WCAG AAA 대비비 충족)
  - Card 배경을 흰색으로 변경, 그림자 제거
  - 버튼 font-weight를 bold로 강화하여 가독성 개선
- **Quick Login Section 개선**
  - 3열 그리드 레이아웃으로 변경 (코드/계정명 2줄 표시)
  - 5행까지 표시, 초과 시 스크롤
  - 버튼 크기 균등화 및 폰트 크기 증가
- **EC Server Manager 개선**
  - V5/V3 selector 크기 통일 (동일 높이, flex 기반 레이아웃)
  - server-row 레이아웃 정리 (flex 정렬)
- **ActionBar 개선**
  - 버튼 균등 너비 적용
  - 텍스트 간소화: "5.0로컬", "3.0로컬", "disableMin"
- **App 레이아웃 개선**
  - 섹션 간 구분선(divider) 추가
  - 모든 섹션 너비 균등화

### Changed (uikit)
- Select/TextInput: `inline-block` → `flex` 기반으로 변경, 높이 28px 통일
- ToggleInput: prefix 컨테이너 높이 통일, gap 축소
- ButtonGroup: `flex-wrap` 추가, `justify-content: space-between` 제거

---

## [Unreleased]

### Added
- **섹션 순서 변경 기능**: SectionSettings 패널에서 ▲/▼ 버튼으로 섹션 표시 순서 변경 가능
  - `section_order.svelte.ts` 스토어 추가 (chrome.storage.sync 기반 영속화)
  - 누락된 섹션 ID 자동 복구, 알 수 없는 ID 자동 필터링
  - 저장 실패 시 이전 순서로 롤백
- **App 동적 렌더링**: 섹션이 저장된 순서대로 렌더링되도록 변경

### Removed
- **접기(Collapse) 토글 기능 제거**: 숨기기/보이기 기능으로 대체
  - `section_collapse.svelte.ts` 스토어 삭제
  - Section 컴포넌트에서 `collapsible`, `collapsed`, `onToggle` props 제거
  - 관련 CSS 스타일(chevron, collapsible) 제거
  - Storage 키 `section_collapse_state` 더 이상 사용하지 않음

### Changed
- **SectionSettings 패널**: 제목 "섹션 표시 설정" → "섹션 설정", 순서 변경 버튼 추가
- **Section 컴포넌트(UIKit)**: 단순화 (title + children만 유지)

---

## 버전 형식 가이드

### [Major.Minor.Patch] - YYYY-MM-DD

- **Major**: 호환되지 않는 API 변경
- **Minor**: 하위 호환성을 유지하면서 기능 추가
- **Patch**: 하위 호환성을 유지하면서 버그 수정

### 카테고리

- **Added**: 새로운 기능
- **Changed**: 기존 기능 변경
- **Deprecated**: 곧 제거될 기능 (다음 메이저 버전)
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련 수정

---

**참고**: 이전 버전의 변경 이력은 기록되지 않았습니다. v2.2.0부터 변경 이력을 관리합니다.
