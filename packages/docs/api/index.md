# API Reference

## Overview

Personal Logseq Plugin의 API 문서입니다.

## 주요 모듈

- [Components](/api/components) - React 컴포넌트
- [Hooks](/api/hooks) - React Hooks
- [Utils](/api/utils) - 유틸리티 함수

## Logseq SDK

이 플러그인은 `@logseq/libs`를 사용합니다:

```ts
import '@logseq/libs';

logseq.ready(() => {
    // 플러그인 초기화
});
```

### 주요 API

- `logseq.ready()` - 플러그인 준비 완료 시 호출
- `logseq.App.registerUIItem()` - UI 아이템 등록
- `logseq.App.registerCommand()` - 명령어 등록
- `logseq.Editor` - 에디터 조작
- `logseq.DB` - 데이터베이스 쿼리

자세한 내용은 [Logseq 공식 문서](https://logseq.github.io/plugins/)를 참조하세요.
