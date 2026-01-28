# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-01-28

### Fixed
- 중복 정의된 `renderApp` 함수 제거
  - 이전: `renderApp` 함수가 65번째 줄과 104번째 줄에 중복 정의되어 있었음
  - 수정: 단일 함수 정의로 통합 (82번째 줄)

### Changed
- LogSeq API 사용법을 공식 문서에 맞게 수정
  - `registerCommand` API 시그니처 수정
    - **변경 전**: 첫 번째 인자로 옵션 객체만 전달
    - **변경 후**: 첫 번째 인자로 문자열 `type` 추가
    - **참고**: [LogSeq Plugin API 문서 - registerCommand](https://logseq.github.io/plugins/interfaces/IAppProxy.html#registerCommand)
  
  ```typescript
  // 변경 전 (잘못된 사용법)
  logseq.App.registerCommand({
      key: 'show-plugin-ui',
      label: 'Show Personal Plugin UI',
      // ...
  }, () => { /* handler */ });

  // 변경 후 (올바른 사용법)
  logseq.App.registerCommand(
      'show-plugin-ui',  // type: string
      {
          key: 'show-plugin-ui',
          label: 'Show Personal Plugin UI',
          keybinding: {
              binding: 'mod+shift+p',
          },
          palette: true,
      },
      () => { /* handler */ }
  );
  ```

### Added
- `registerCommandPalette` API 추가로 명령어 팔레트 지원 강화
  - 사용자가 `mod+shift+t` 단축키로 플러그인 UI를 토글할 수 있도록 명령어 팔레트에 등록
  - **참고**: [LogSeq Plugin API 문서 - registerCommandPalette](https://logseq.github.io/plugins/interfaces/IAppProxy.html#registerCommandPalette)
  
  ```typescript
  logseq.App.registerCommandPalette(
      {
          key: 'toggle-plugin-ui-palette',
          label: 'Toggle Personal Plugin UI',
          keybinding: {
              binding: 'mod+shift+t',
          },
      },
      () => {
          logseq.toggleMainUI();
      }
  );
  ```

## 관련 문서

- [LogSeq Plugin API 공식 문서](https://logseq.github.io/plugins/interfaces/IAppProxy.html)
- [LogSeq Plugin 개발 가이드](https://logseq.github.io/plugins/)

## 기술적 세부사항

### 변경된 파일
- `src/main.tsx`

### 변경 내용 요약
1. **코드 중복 제거**: `renderApp` 함수의 중복 정의를 제거하여 코드 유지보수성 향상
2. **API 호환성 개선**: LogSeq 공식 API 문서에 맞게 모든 API 호출 수정
3. **기능 확장**: 명령어 팔레트 지원 추가로 사용자 접근성 향상

### 마이그레이션 가이드
이번 변경사항은 내부 구현 변경이므로 플러그인 사용자에게는 영향이 없습니다. 
다만 플러그인 개발자라면 다음 사항을 참고하세요:

- `registerCommand` 사용 시 첫 번째 인자로 문자열 `type`을 반드시 포함해야 합니다
- 명령어 팔레트 기능을 활용하려면 `registerCommandPalette` API를 사용하세요
