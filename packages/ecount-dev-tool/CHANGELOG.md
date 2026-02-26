# Changelog

이 패키지의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.3.0] - 2026-02-26

### Changed

- SectionSettings: clickOutside + 수동 상태 → Popover + CheckboxList Compound API
- QuickLoginSection: Section flat API → Section Compound API
- ServerManager: Section + ToggleInput flat API → Compound API, 이중 토글 방지
- ActionBar: Section flat API → Section Compound API
- StageManager: Section flat API → Section Compound API

## [0.2.0] - 2026-02-09

### Changed

- (v2.2.0 → v2.3.0)
  - Vanilla JavaScript → Svelte 5 + TypeScript 완전 리팩토링
  - 컴포넌트 기반 아키텍처로 전환 (8개 컴포넌트)
  - 서비스 레이어 분리 (url_service, tab_service, page_actions)
  - Svelte Store 기반 상태 관리
  - @personal/uikit 통합
  - 타입 안정성 강화

## [0.1.0] - 2026-02-06

### Added

- (v2.2.0) - Chrome 확장프로그램
  - Quick Login 기능
  - EC Server Manager (V5/V3 서버 전환)
  - Local Server Buttons
  - Stage Server Manager
