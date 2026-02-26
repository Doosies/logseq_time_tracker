# Changelog

이 패키지의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Fixed

- DnD 드래그 시 아이템 위치 변경 안 되는 버그 수정 - CSS `transform` 충돌 해결
- DnD 드래그 시 `<select>` 요소의 선택값이 초기값으로 리셋되는 버그 수정 - ghost 요소에 select value 동기화

### Added

- 헤드리스 Dnd Compound Component (`Dnd.Zone`, `Dnd.Row`, `Dnd.Handle`)
  - `Dnd.Zone`: svelte-dnd-action 래퍼, children snippet 렌더링
  - `Dnd.Row`: 최소 스타일 드래그 가능 행 래퍼
  - `Dnd.Handle`: DragHandle re-export
  - namespace import 지원: `import { Dnd } from '@personal/uikit'`

### Changed

- Dnd.Zone: `dndzone` → `dragHandleZone` 전환으로 핸들 전용 드래그 지원
- DragHandle: `use:dragHandle` action 적용, cursor 라이브러리 자동 관리로 전환
- Dnd.Zone에서 `dragHandleSelector`, `interactiveSelector` props 및 `blockDragFromInteractive` 제거
- Dnd.Row에서 cursor:grab CSS 제거 (핸들 전용 드래그)

## [0.1.0] - 2026-02-09

### Added

- Svelte 5 기반 공유 UI 컴포넌트 라이브러리
  - Button, ButtonGroup 컴포넌트
  - Card, Section 레이아웃 컴포넌트
  - TextInput, ToggleInput, Select 입력 컴포넌트
  - vanilla-extract 기반 디자인 시스템
  - Light/Dark 테마 지원
  - 디자인 토큰 시스템 (Contract)
