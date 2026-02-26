# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

> 패키지별 변경사항은 각 패키지의 CHANGELOG를 참조하세요:
> [uikit](./packages/uikit/CHANGELOG.md), [ecount-dev-tool](./packages/ecount-dev-tool/CHANGELOG.md),
> [mcp-server](./packages/mcp-server/CHANGELOG.md), [time-tracker](./packages/time-tracker/CHANGELOG.md), [docs](./packages/docs/CHANGELOG.md)

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
