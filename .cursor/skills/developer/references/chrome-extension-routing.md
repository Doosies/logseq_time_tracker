---
name: chrome-extension-routing
description: Chrome Extension 다중 페이지·URL hash 라우팅 구현 패턴. editor.html 분리, vite-plugin-web-extension additionalInputs, chrome.tabs API 사용
---

# Chrome Extension 라우팅 패턴

이 문서는 Chrome Extension에서 popup 외 별도 페이지(예: editor.html)를 추가하고 URL hash 기반 라우팅을 구현할 때 참조합니다.

## 사용 시점

- Tampermonkey/Greasemonkey 스타일 편집 페이지 구현 시
- 팝업 대신 전체 화면 활용 페이지가 필요할 때
- URL hash로 상태 전달 (`#new`, `#script-id`)이 필요할 때

---

## 1. 다중 HTML 진입점 (editor.html 분리)

### vite-plugin-web-extension 설정

```typescript
// vite.config.ts
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    webExtension({
      manifest: './src/manifest.json',
      browser: 'chrome',
      additionalInputs: ['src/editor.html'],
    }),
  ],
});
```

**체크리스트**:
- [ ] `additionalInputs`에 추가 HTML 경로 등록
- [ ] HTML 파일이 `src/` 기준 상대 경로로 지정됨
- [ ] manifest.json `web_accessible_resources`에 해당 페이지 등록 (필요 시)

### HTML 구조

```html
<!-- src/editor.html -->
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Extension - 편집</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./editor.ts"></script>
  </body>
</html>
```

---

## 2. URL Hash 라우팅

### hash 파싱

```typescript
// router.ts
export function parseHash(): string | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  if (hash === 'new') return 'new';
  // 관대한 파싱: UUID 검증 생략, 페이지 컴포넌트에서 최종 검증
  return hash;
}
```

**원칙**: hash 파싱은 관대하게, 비즈니스 검증(ID 존재 여부, 권한 등)은 페이지 컴포넌트에서 수행합니다.

### 편집 페이지 열기

```typescript
export async function openEditor(script_id?: string): Promise<void> {
  const url = chrome.runtime.getURL(`src/editor.html#${script_id || 'new'}`);
  await chrome.tabs.create({ url });
}
```

**주의**:
- `chrome.runtime.getURL()`은 extension 프로토콜 절대 경로 반환
- hash는 수동 concat (getURL에 query/hash 포함 불가)
- `chrome.tabs.create`는 팝업/백그라운드 컨텍스트에서만 호출 가능

### 편집 페이지 닫기

```typescript
export async function closeEditor(): Promise<void> {
  const tab = await chrome.tabs.getCurrent();
  if (tab?.id) {
    await chrome.tabs.remove(tab.id);
  }
}
```

**주의**: `chrome.tabs.getCurrent()`는 extension 페이지(editor.html) 컨텍스트에서만 유효. popup에서는 `undefined` 반환 가능.

---

## 3. chrome.tabs API 사용 시 주의사항

| API | 호출 컨텍스트 | 비고 |
|-----|---------------|------|
| `chrome.tabs.create` | popup, background | extension 페이지에서는 호출 불가 |
| `chrome.tabs.getCurrent` | extension 페이지(editor.html 등) | popup에서는 보통 undefined |
| `chrome.tabs.remove` | extension 페이지, background | 현재 탭 ID로 호출 |
| `chrome.runtime.getURL` | 모든 컨텍스트 | extension URL 생성 |

---

## 4. 경로 alias 설정

Svelte/TypeScript에서 `#utils/*`, `#components/*` 등 alias 사용 시:

- `tsconfig.json`: `compilerOptions.paths` 설정
- `vite.config.ts`: `resolve.alias` (shared config에서 상속 가능)
- `package.json`: `exports` 필드로 패키지 내부 경로 매핑

---

## 5. 체크리스트

Chrome Extension에 별도 페이지(editor.html 등) 추가 시:

- [ ] `vite.config.ts`에 `additionalInputs` 등록
- [ ] `chrome.runtime.getURL()`로 extension URL 생성
- [ ] hash 파싱은 관대하게, 검증은 페이지 컴포넌트에서
- [ ] `chrome.tabs.create/getCurrent/remove`는 호출 컨텍스트 확인
- [ ] manifest `web_accessible_resources` 또는 권한 확인

---

## 참조

- chrome-extension-testing: QA 스킬의 chrome API mock 패턴
- config-optimization: Vite 웹 확장 빌드 설정
