# Changelog

이 패키지의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Fixed

- DnD 핸들 hover 스타일이 섹션 전체가 아닌 핸들 요소에 직접 hover할 때만 적용되도록 수정

### Added

- DnD handleFinalize 콜백 로직 단위 테스트 5개

### Changed

- DndZone + snippet API → Dnd.Zone + each + Dnd.Row compound API로 마이그레이션 ([@personal/uikit](./packages/uikit) 기반)
- App.svelte에서 DRAG_HANDLE_SELECTOR 상수 및 관련 cursor CSS 제거
- SectionSettings.svelte에서 cursor:grab CSS 제거

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
