---
name: changelog-generation
description: CHANGELOG.md 작성 규칙 및 형식
---

# CHANGELOG 생성 가이드

이 Skill은 문서화 에이전트가 CHANGELOG.md를 작성하는 방법을 제공합니다.

## CHANGELOG란?

프로젝트의 **모든 중요한 변경사항**을 시간순으로 기록한 파일입니다.

### 목적
- 사용자에게 변경사항 알림
- 마이그레이션 가이드 제공
- 버전별 차이점 명확화

---

## 형식

### Keep a Changelog 형식 사용

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 새로운 기능 추가

### Changed
- 기존 기능 변경

### Deprecated
- 곧 제거될 기능

### Removed
- 제거된 기능

### Fixed
- 버그 수정

### Security
- 보안 관련 수정

## [1.0.0] - 2024-01-28

### Added
- 초기 릴리스
```

---

## 변경 유형

### 1. Added (추가)
새로운 기능이 추가되었을 때

```markdown
### Added
- 사용자 인증 API 추가
- 이메일 알림 기능 추가
- 다크 모드 지원 추가
```

### 2. Changed (변경)
기존 기능이 변경되었을 때

```markdown
### Changed
- API 응답 형식을 JSON에서 JSON:API로 변경
- 기본 타임아웃을 5초에서 10초로 증가
- 사용자 인터페이스 재디자인
```

### 3. Deprecated (폐기 예정)
곧 제거될 기능 (다음 메이저 버전에서)

```markdown
### Deprecated
- `getUserByEmail()` 함수는 v2.0에서 제거 예정, `findUser()` 사용 권장
- `/api/v1` 엔드포인트는 2025년 12월 31일에 종료
```

### 4. Removed (제거)
제거된 기능

```markdown
### Removed
- 구버전 API v1 제거
- Internet Explorer 11 지원 중단
- 사용하지 않는 `oldFeature()` 함수 제거
```

### 5. Fixed (수정)
버그 수정

```markdown
### Fixed
- 로그인 시 세션 만료 버그 수정
- 빈 배열 처리 시 크래시 문제 해결
- 타임존 계산 오류 수정 (#123)
```

### 6. Security (보안)
보안 관련 수정

```markdown
### Security
- XSS 취약점 패치
- SQL Injection 방어 강화
- 의존성 보안 업데이트 (CVE-2024-1234)
```

---

## Semantic Versioning (Semver)

### 버전 형식: MAJOR.MINOR.PATCH

```
1.2.3
│ │ │
│ │ └─ PATCH: 버그 수정
│ └─── MINOR: 새 기능 (하위 호환)
└───── MAJOR: Breaking Changes
```

### 버전 증가 규칙

#### MAJOR (1.0.0 → 2.0.0)
- Breaking Changes (기존 코드가 깨짐)
- API 시그니처 변경
- 제거된 기능

```markdown
## [2.0.0] - 2024-01-28

### Changed
- **BREAKING**: `createUser(email)` → `createUser(data: UserData)`로 변경
- **BREAKING**: 최소 Node.js 버전 14 → 18로 상향

### Removed
- **BREAKING**: `oldApi()` 함수 제거
```

#### MINOR (1.0.0 → 1.1.0)
- 새 기능 추가 (하위 호환)
- 기능 개선
- Deprecated 추가

```markdown
## [1.1.0] - 2024-01-28

### Added
- 이메일 검증 기능 추가
- 비밀번호 강도 체크 추가

### Deprecated
- `oldMethod()`는 v2.0에서 제거 예정
```

#### PATCH (1.0.0 → 1.0.1)
- 버그 수정만
- 보안 패치
- 성능 개선

```markdown
## [1.0.1] - 2024-01-28

### Fixed
- 로그인 실패 시 에러 메시지 버그 수정
- 메모리 누수 문제 해결

### Security
- XSS 취약점 패치
```

---

## 작성 가이드

### 1. 사용자 관점으로 작성

**❌ 나쁜 예: 개발자 관점**
```markdown
### Fixed
- `getUserById` 함수의 null 체크 추가
- `auth.ts` 파일 리팩토링
```

**✅ 좋은 예: 사용자 관점**
```markdown
### Fixed
- 존재하지 않는 사용자 조회 시 크래시 문제 해결
- 로그인 성능 50% 향상
```

### 2. 구체적으로 작성

**❌ 나쁜 예: 모호함**
```markdown
### Changed
- 코드 개선
- 버그 수정
```

**✅ 좋은 예: 구체적**
```markdown
### Changed
- API 응답 시간을 500ms에서 200ms로 개선

### Fixed
- Safari에서 파일 업로드 실패 문제 해결 (#156)
```

### 3. 이슈 번호 포함

```markdown
### Fixed
- 로그인 세션 만료 버그 수정 (#123)
- 다크 모드 테마 깜빡임 문제 해결 (#145)

### Added
- 다국어 지원 추가 (#167)
```

### 4. Breaking Changes 강조

```markdown
### Changed
- **BREAKING**: `config.timeout` 단위가 초에서 밀리초로 변경
  
  마이그레이션:
  ```typescript
  // Before
  config.timeout = 5;  // 5초
  
  // After
  config.timeout = 5000;  // 5000ms = 5초
  ```
```

---

## 예시

### 전체 CHANGELOG 예시

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- 소셜 로그인 (Google, GitHub) 지원 예정

### Changed
- API 요청 로깅 개선 중

## [2.0.0] - 2024-01-28

### Added
- TypeScript 지원 추가
- Docker 컨테이너 배포 스크립트 추가
- E2E 테스트 스위트 추가

### Changed
- **BREAKING**: Node.js 최소 버전 14 → 18
- **BREAKING**: `createUser` API 시그니처 변경
  ```typescript
  // Before
  createUser(email: string)
  
  // After
  createUser(data: { email: string; name: string })
  ```
- 데이터베이스를 MySQL에서 PostgreSQL로 마이그레이션
- 전체 UI 리뉴얼

### Deprecated
- `getUserByEmail()` 함수는 v3.0에서 제거 예정
  - 대신 `findUser({ email })` 사용

### Removed
- **BREAKING**: API v1 완전 제거
- Internet Explorer 11 지원 중단
- `legacyAuth()` 함수 제거

### Fixed
- 동시 요청 시 세션 충돌 버그 수정 (#234)
- 파일 업로드 크기 제한 버그 해결 (#245)
- 타임존 변환 오류 수정 (#256)

### Security
- JWT 토큰 서명 알고리즘 강화
- CSRF 보호 기능 추가
- 의존성 보안 업데이트 (15개 취약점 해결)

## [1.5.2] - 2024-01-15

### Fixed
- 로그인 페이지 무한 로딩 버그 수정 (#230)
- 이메일 검증 정규식 오류 해결 (#231)

### Security
- XSS 취약점 패치 (CVE-2024-1234)

## [1.5.1] - 2024-01-10

### Fixed
- 프로필 이미지 업로드 실패 문제 해결 (#220)
- 메모리 누수 수정 (#222)

## [1.5.0] - 2024-01-05

### Added
- 비밀번호 강도 체커 추가
- 2단계 인증 (2FA) 지원

### Changed
- 세션 타임아웃을 30분으로 증가
- API 응답 캐싱 개선

### Fixed
- 페이지네이션 버그 수정 (#210)

## [1.0.0] - 2024-01-01

### Added
- 초기 릴리스
- 사용자 인증 (로그인/로그아웃)
- 프로필 관리
- REST API

[Unreleased]: https://github.com/user/repo/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/user/repo/compare/v1.5.2...v2.0.0
[1.5.2]: https://github.com/user/repo/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/user/repo/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/user/repo/compare/v1.0.0...v1.5.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

---

## 업데이트 시점

### Unreleased 섹션

개발 중 즉시 추가:

```markdown
## [Unreleased]

### Added
- 새 기능 추가 (PR #123)

### Fixed
- 버그 수정 (PR #124)
```

### 릴리스 시

Unreleased → 버전으로 변경:

```markdown
## [1.1.0] - 2024-01-28

### Added
- 새 기능 추가 (PR #123)

### Fixed
- 버그 수정 (PR #124)

## [1.0.0] - 2024-01-01
...
```

---

## 체크리스트

CHANGELOG 작성 완료 후:

### 내용
- [ ] 모든 주요 변경사항 포함
- [ ] 변경 유형별로 분류 (Added/Changed/Fixed 등)
- [ ] 사용자 관점으로 작성
- [ ] 구체적인 설명
- [ ] 이슈 번호 포함

### 형식
- [ ] Keep a Changelog 형식 준수
- [ ] Semantic Versioning 준수
- [ ] Breaking Changes 강조 (**BREAKING**)
- [ ] 마이그레이션 가이드 포함 (필요 시)
- [ ] 날짜 형식: YYYY-MM-DD

### 버전
- [ ] 올바른 버전 번호 (Semver)
- [ ] Unreleased 섹션 존재
- [ ] 버전 비교 링크 포함 (GitHub/GitLab)

---

## 완료 기준

- [ ] CHANGELOG.md 파일 생성 또는 업데이트
- [ ] 모든 변경사항 문서화
- [ ] Keep a Changelog 형식 준수
- [ ] Semantic Versioning 준수
- [ ] Breaking Changes 명확히 표시
