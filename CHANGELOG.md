# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

> 패키지별 변경사항은 각 패키지의 CHANGELOG를 참조하세요:
> [uikit](./packages/uikit/CHANGELOG.md), [ecount-dev-tool](./packages/ecount-dev-tool/CHANGELOG.md),
> [mcp-server](./packages/mcp-server/CHANGELOG.md), [time-tracker](./packages/time-tracker/CHANGELOG.md), [docs](./packages/docs/CHANGELOG.md)

## [0.3.1] - 2026-02-27

### Changed

- QuickLoginSection: 계정 편집 폼 버튼 순서 변경 (취소 → 수정) (ecount-dev-tool)

### Fixed

- QuickLoginSection: 편집 모드에서 팝업 닫힘 시 미저장 변경사항이 유지되던 버그 수정 (ecount-dev-tool)
- QuickLoginSection: 로그인 후 섹션 헤더가 항상 파란색으로 표시되던 문제 수정 (ecount-dev-tool)
- Sortable: DnD 시 빠른로그인 섹션 버벅거림 수정 (uikit)
- Storybook stories: Popover, Toast, ActionBar에서 존재하지 않는 scenario argTypes 제거 (uikit)

## [0.3.0] - 2026-02-26

### Added (프로젝트 전역)

- Storybook `addon-docs`, `addon-a11y` 추가
- Storybook autodocs 전역 활성화
- `prettier-plugin-svelte` 추가 및 전체 포매팅 적용
- Storybook + Vitest 테스트 환경 설정
- `svelte-dnd-action`을 pnpm catalog에 추가

### Changed (프로젝트 전역)

- ESLint `tsconfigRootDir` 설정 추가 - `createSvelteConfig`에 매개변수 전달
- `@storybook/addon-essentials` 제거 (Storybook 10 내장)
- Storybook CSF 마이그레이션 및 경로 별칭을 Node.js subpath imports로 전환
- 빌드 설정 통합, ESLint 개선, 테스트 구조 정리
- 컴포넌트 단위 테스트를 Storybook play function으로 통합

## [0.2.0] - 2026-02-09

### Changed (프로젝트 전역)

- TypeScript 설정 통합 및 개선
  - `tsconfig.base.json` 개선
  - 공통 타입 설정 중앙화
- ESLint 설정 통합
  - 공통 ESLint 규칙 생성 (`eslint.config.js`)
  - 패키지별 ESLint 설정 통합
- 의존성 관리 최적화
  - `pnpm-workspace.yaml`에 catalog 추가
  - 버전 관리 중앙화

## [0.1.0] - 2026-02-06

### Added

- 모노레포 초기 구성
  - Turborepo 빌드 시스템 설정
  - pnpm 워크스페이스 구성
  - 공통 개발 도구 설정
    - TypeScript 5.9
    - ESLint & Prettier
    - Vitest (테스트 프레임워크)
