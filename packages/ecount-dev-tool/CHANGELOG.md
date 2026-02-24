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
