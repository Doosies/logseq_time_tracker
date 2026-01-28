# Quick Start

이 가이드는 5분 안에 플러그인을 Logseq에 로드하고 실행하는 방법을 안내합니다.

## 1. 개발 서버 실행

```bash
pnpm dev
```

## 2. Logseq 개발자 모드 활성화

1. Logseq 열기
2. `Settings` → `Advanced` → `Developer mode` 활성화

## 3. 플러그인 로드

1. `...` 메뉴 클릭
2. `Plugins` 선택
3. `Load unpacked plugin` 클릭
4. `packages/plugin` 디렉토리 선택

## 4. 플러그인 확인

툴바에 플러그인 아이콘이 나타나면 성공입니다! 🎉

## 5. 코드 수정해보기

`packages/plugin/src/App.tsx` 파일을 열고 텍스트를 수정해보세요. HMR이 작동하여 자동으로 업데이트됩니다.

```tsx
<h1 style={styles.title}>나만의 Logseq 플러그인</h1>
```

## 6. 테스트 실행

```bash
cd packages/plugin
pnpm test
```

## 다음 단계

- [프로젝트 구조](/guide/project-structure) 이해하기
- [설정](/guide/configuration) 커스터마이징
- [API 레퍼런스](/api/) 살펴보기
