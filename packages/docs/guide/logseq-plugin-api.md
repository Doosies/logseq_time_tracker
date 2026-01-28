# LogSeq 플러그인 API 종합 가이드

> LogSeq 플러그인 개발을 위한 실무 중심 API 레퍼런스 및 튜토리얼

## 목차

- [개요](#개요)
- [설치 및 설정](#설치-및-설정)
- [플러그인 구조](#플러그인-구조)
- [API 레퍼런스](#api-레퍼런스)
- [실전 예제](#실전-예제)
- [트러블슈팅](#트러블슈팅)
- [FAQ](#faq)

---

## 개요

LogSeq 플러그인은 LogSeq의 기능을 확장하여 사용자 정의 기능을 추가할 수 있게 해주는 시스템입니다. React, Vue, 또는 순수 JavaScript를 사용하여 개발할 수 있으며, 강력한 API를 통해 LogSeq의 핵심 기능에 접근할 수 있습니다.

### 주요 특징

- **UI 확장**: 커스텀 UI 컴포넌트 추가
- **명령어 등록**: 단축키 및 명령 팔레트 통합
- **데이터 접근**: 블록, 페이지, 데이터베이스 조작
- **이벤트 처리**: LogSeq 이벤트 구독 및 처리
- **테마 지원**: 커스텀 테마 및 스타일 제공

### 공식 리소스

- **공식 문서**: [plugins-doc.logseq.com](https://plugins-doc.logseq.com/)
- **API 레퍼런스**: [logseq.github.io/plugins](https://logseq.github.io/plugins/)
- **샘플 코드**: [logseq-plugin-samples](https://github.com/logseq/logseq-plugin-samples)

---

## 설치 및 설정

### 1. SDK 설치

```bash
npm install @logseq/libs
# 또는
pnpm add @logseq/libs
# 또는
yarn add @logseq/libs
```

### 2. 기본 설정

플러그인 진입점 파일에서 SDK를 import합니다:

```typescript
import '@logseq/libs';
```

이 import는 `logseq` 전역 객체를 제공합니다.

### 3. package.json 설정

`package.json`에 LogSeq 플러그인 메타데이터를 추가합니다:

```json
{
  "logseq": {
    "id": "your-plugin-id",
    "title": "Your Plugin Title",
    "icon": "./logo.svg",
    "main": "dist/index.html"
  }
}
```

**설명**:
- `id`: 플러그인의 고유 식별자 (필수)
- `title`: 플러그인 표시 이름
- `icon`: 플러그인 아이콘 경로
- `main`: 플러그인 진입점 HTML 파일 경로

---

## 플러그인 구조

### 기본 구조

```
plugin/
├── src/
│   ├── main.tsx          # 플러그인 진입점
│   ├── App.tsx           # 메인 UI 컴포넌트
│   └── ...
├── dist/                 # 빌드 결과물
│   └── index.html        # LogSeq가 로드할 HTML
├── package.json
└── vite.config.ts        # Vite 설정
```

### 플러그인 모드

LogSeq 플러그인은 두 가지 모드를 지원합니다:

1. **shadow 모드**: Shadow DOM을 사용하여 스타일 격리
2. **iframe 모드**: iframe을 사용하여 완전한 격리

`package.json`에서 설정:

```json
{
  "logseq": {
    "mode": "shadow"  // 또는 "iframe"
  }
}
```

---

## API 레퍼런스

### 초기화 API

#### logseq.ready()

**설명**: LogSeq 앱이 플러그인을 실행할 준비가 되었을 때 호출됩니다. 모든 플러그인 초기화 코드는 이 콜백 내부에 작성해야 합니다.

**시그니처**:
```typescript
ready(callback?: (e: any) => void | {}): Promise<any>
ready(model?: Record<string, any>, callback?: (e: any) => void | {}): Promise<any>
```

**매개변수**:
- `callback`: 플러그인 초기화 콜백 함수
- `model`: `provideModel`과 함께 사용할 모델 객체 (선택사항)

**반환값**: Promise

**예제**:
```typescript
logseq.ready(() => {
    console.log('Plugin initialized');
    // 플러그인 초기화 코드
});

// 또는 모델과 함께
logseq.provideModel({
    myMethod() {
        console.log('Called from UI');
    }
});

logseq.ready({ myMethod }, () => {
    // 초기화 코드
});
```

**주의사항**: 
- `ready()` 호출 전에는 대부분의 LogSeq API를 사용할 수 없습니다.
- `setMainUIInlineStyle()` 같은 일부 API는 `ready()` 호출 전에도 사용 가능합니다.

---

### UI 관련 API

#### logseq.setMainUIInlineStyle()

**설명**: 플러그인의 메인 UI 컨테이너에 인라인 스타일을 설정합니다. 주로 UI 위치, 크기, z-index 등을 설정하는 데 사용됩니다.

**시그니처**:
```typescript
setMainUIInlineStyle(style: CSS.Properties): void
```

**매개변수**:
- `style`: CSS 속성 객체

**반환값**: 없음

**예제**:
```typescript
logseq.setMainUIInlineStyle({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 999,
    width: '500px',
    height: '400px',
});
```

**주의사항**: 
- `ready()` 호출 전에도 사용 가능합니다.
- CSS 속성은 camelCase 형식으로 작성해야 합니다.

---

#### logseq.showMainUI()

**설명**: 플러그인의 메인 UI를 표시합니다.

**시그니처**:
```typescript
showMainUI(opts?: { autoFocus: boolean }): void
```

**매개변수**:
- `opts.autoFocus`: UI 표시 시 자동 포커스 여부 (기본값: false)

**반환값**: 없음

**예제**:
```typescript
logseq.showMainUI({ autoFocus: true });
```

---

#### logseq.hideMainUI()

**설명**: 플러그인의 메인 UI를 숨깁니다.

**시그니처**:
```typescript
hideMainUI(opts?: { restoreEditingCursor: boolean }): void
```

**매개변수**:
- `opts.restoreEditingCursor`: UI 숨김 시 편집 커서 복원 여부 (기본값: false)

**반환값**: 없음

**예제**:
```typescript
logseq.hideMainUI({ restoreEditingCursor: true });
```

---

#### logseq.toggleMainUI()

**설명**: 플러그인의 메인 UI 표시/숨김을 토글합니다.

**시그니처**:
```typescript
toggleMainUI(): void
```

**반환값**: 없음

**예제**:
```typescript
logseq.toggleMainUI();
```

---

#### logseq.provideUI()

**설명**: LogSeq의 특정 위치에 커스텀 UI를 삽입합니다. 툴바, 페이지바, 또는 특정 DOM 요소에 UI를 추가할 수 있습니다.

**시그니처**:
```typescript
provideUI(ui: UIOptions): this
```

**매개변수**:
- `ui`: UI 옵션 객체
  - `key`: UI의 고유 키
  - `template`: HTML 템플릿 문자열
  - `path`: DOM 선택자 (예: `#search`)
  - `slot`: 슬롯 키 (예: `toolbar`, `pagebar`)
  - `style`: CSS 스타일 객체
  - `attrs`: HTML 속성 객체
  - `close`: 외부 클릭 시 닫기 옵션 (`'outside'` 또는 선택자)

**반환값**: `logseq` 객체 (체이닝 가능)

**예제**:
```typescript
// 툴바에 버튼 추가
logseq.provideUI({
    key: 'my-toolbar-button',
    slot: 'toolbar',
    template: `
        <a data-on-click="myButtonClick" class="button" title="My Button">
            <i class="ti ti-box"></i>
        </a>
    `,
});

// 특정 DOM 요소에 UI 추가
logseq.provideUI({
    key: 'search-extension',
    path: '#search',
    template: `
        <div style="padding: 10px;">
            <button data-on-click="searchAction">Search</button>
        </div>
    `,
});
```

**주의사항**: 
- `data-on-click` 속성으로 클릭 이벤트를 처리하려면 `provideModel()`로 해당 메서드를 등록해야 합니다.
- HTML 문자열 내에서 이벤트 핸들러를 직접 전달할 수 없습니다.

---

#### logseq.provideModel()

**설명**: UI 템플릿에서 참조할 수 있는 메서드 모델을 제공합니다. `provideUI()`의 `data-on-click` 속성과 함께 사용됩니다.

**시그니처**:
```typescript
provideModel(model: Record<string, any>): this
```

**매개변수**:
- `model`: 메서드가 포함된 객체

**반환값**: `logseq` 객체 (체이닝 가능)

**예제**:
```typescript
logseq.provideModel({
    togglePluginUI() {
        console.log('Toggle UI clicked');
        logseq.toggleMainUI();
    },
    myButtonClick() {
        logseq.UI.showMsg('Button clicked!');
    },
});

// UI 템플릿에서 사용
logseq.provideUI({
    key: 'toolbar-btn',
    slot: 'toolbar',
    template: `
        <a data-on-click="togglePluginUI" class="button">
            <i class="ti ti-box"></i>
        </a>
    `,
});
```

**주의사항**: 
- 모델 메서드는 비동기 함수일 수 있습니다.
- `ready()` 호출 전에 `provideModel()`을 호출할 수 있습니다.

---

#### logseq.provideStyle()

**설명**: LogSeq 앱에 커스텀 CSS를 주입합니다. 전역 스타일을 변경하거나 플러그인 UI 스타일을 추가하는 데 사용됩니다.

**시그니처**:
```typescript
provideStyle(style: StyleString | StyleOptions): this
```

**매개변수**:
- `style`: CSS 문자열 또는 옵션 객체
  - `key`: 스타일의 고유 키 (옵션)
  - `style`: CSS 문자열

**반환값**: `logseq` 객체 (체이닝 가능)

**예제**:
```typescript
// CSS 문자열 직접 전달
logseq.provideStyle(`
    .my-plugin-button {
        background: #007bff;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
    }
`);

// 옵션 객체 사용
logseq.provideStyle({
    key: 'my-plugin-styles',
    style: `
        @import url("https://fonts.googleapis.com/css2?family=Roboto");
        body {
            font-family: 'Roboto', sans-serif;
        }
    `,
});
```

---

### 명령어 등록 API

#### logseq.App.registerUIItem()

**설명**: 툴바 또는 페이지바에 UI 아이템을 등록합니다. `provideUI()`의 간편한 대안입니다.

**시그니처**:
```typescript
registerUIItem(type: 'toolbar' | 'pagebar', opts: {
    key: string;
    template: string;
}): void
```

**매개변수**:
- `type`: UI 아이템 타입 (`'toolbar'` 또는 `'pagebar'`)
- `opts.key`: UI 아이템의 고유 키
- `opts.template`: HTML 템플릿 문자열

**반환값**: 없음

**예제**:
```typescript
logseq.App.registerUIItem('toolbar', {
    key: 'my-toolbar-item',
    template: `
        <a data-on-click="toggleUI" class="button" title="Toggle UI">
            <i class="ti ti-box"></i>
        </a>
    `,
});
```

**주의사항**: 
- `data-on-click` 핸들러는 `provideModel()`로 등록해야 합니다.
- `ready()` 콜백 내부에서 호출해야 합니다.

---

#### logseq.App.registerCommand()

**설명**: 명령어를 등록합니다. 단축키와 명령 팔레트에 표시될 수 있습니다.

**시그니처**:
```typescript
registerCommand(
    type: string,
    opts: {
        key: string;
        label: string;
        desc?: string;
        palette?: boolean;
        keybinding?: SimpleCommandKeybinding;
    },
    action: SimpleCommandCallback
): void
```

**매개변수**:
- `type`: 명령어 타입 (일반적으로 명령어 키와 동일)
- `opts.key`: 명령어의 고유 키
- `opts.label`: 명령어 표시 이름
- `opts.desc`: 명령어 설명 (선택사항)
- `opts.palette`: 명령 팔레트에 표시할지 여부 (기본값: false)
- `opts.keybinding`: 단축키 설정
  - `binding`: 단축키 문자열 (예: `'mod+shift+p'`)
  - `mode`: 단축키 모드 (`'global'`, `'non-editing'`, `'editing'`)
  - `mac`: Mac 전용 단축키 (선택사항)
- `action`: 명령어 실행 시 호출될 콜백 함수

**반환값**: 없음

**예제**:
```typescript
logseq.App.registerCommand(
    'show-plugin-ui',
    {
        key: 'show-plugin-ui',
        label: 'Show Personal Plugin UI',
        desc: 'Open the personal plugin interface',
        keybinding: {
            binding: 'mod+shift+p',
            mode: 'global',
        },
        palette: true,
    },
    () => {
        console.log('Command executed: show-plugin-ui');
        logseq.showMainUI();
    },
);
```

**단축키 형식**:
- `mod`: Cmd (Mac) 또는 Ctrl (Windows/Linux)
- `shift`, `alt`, `ctrl`: 수정자 키
- 예: `'mod+shift+p'`, `'ctrl+alt+t'`, `'cmd+k'` (Mac 전용)

---

#### logseq.App.registerCommandPalette()

**설명**: 명령 팔레트에 명령어를 등록합니다. `registerCommand()`와 유사하지만 팔레트 전용입니다.

**시그니처**:
```typescript
registerCommandPalette(
    opts: {
        key: string;
        label: string;
        keybinding?: SimpleCommandKeybinding;
    },
    action: SimpleCommandCallback
): void
```

**매개변수**:
- `opts.key`: 명령어의 고유 키
- `opts.label`: 명령어 표시 이름
- `opts.keybinding`: 단축키 설정 (선택사항)
- `action`: 명령어 실행 시 호출될 콜백 함수

**반환값**: 없음

**예제**:
```typescript
logseq.App.registerCommandPalette(
    {
        key: 'toggle-plugin-ui-palette',
        label: 'Toggle Personal Plugin UI',
        keybinding: {
            binding: 'ctrl+shift+e',
        },
    },
    () => {
        console.log('Command palette executed');
        logseq.toggleMainUI();
    },
);
```

---

### 이벤트 API

#### logseq.on()

**설명**: LogSeq 이벤트를 구독합니다. 다양한 이벤트 타입을 지원합니다.

**시그니처**:
```typescript
on(event: LSPluginUserEvents, callback: (e: IHookEvent & E) => void): IUserOffHook
```

**매개변수**:
- `event`: 이벤트 타입
  - `'ui:visible:changed'`: UI 표시 상태 변경
  - `'settings:changed'`: 설정 변경
- `callback`: 이벤트 발생 시 호출될 콜백 함수

**반환값**: 이벤트 구독 해제 함수

**예제**:
```typescript
// UI 표시 상태 변경 감지
const unsubscribe = logseq.on('ui:visible:changed', ({ visible }) => {
    console.log('UI visibility changed:', visible);
});

// 나중에 구독 해제
unsubscribe();

// 설정 변경 감지
logseq.onSettingsChanged((newSettings, oldSettings) => {
    console.log('Settings changed:', newSettings);
});
```

**지원 이벤트**:
- `ui:visible:changed`: 플러그인 UI 표시/숨김 상태 변경
- `settings:changed`: 플러그인 설정 변경

---

#### logseq.App.onThemeModeChanged

**설명**: 테마 모드(라이트/다크) 변경을 감지합니다.

**시그니처**:
```typescript
onThemeModeChanged: IUserHook<{ mode: 'dark' | 'light' }>
```

**예제**:
```typescript
logseq.App.onThemeModeChanged(({ mode }) => {
    console.log('Theme mode changed to:', mode);
    // 테마에 따라 UI 업데이트
    if (mode === 'dark') {
        // 다크 모드 스타일 적용
    } else {
        // 라이트 모드 스타일 적용
    }
});
```

---

#### logseq.App.onCurrentGraphChanged

**설명**: 현재 그래프 변경을 감지합니다.

**시그니처**:
```typescript
onCurrentGraphChanged: IUserHook
```

**예제**:
```typescript
logseq.App.onCurrentGraphChanged(async () => {
    const graph = await logseq.App.getCurrentGraph();
    console.log('Current graph changed:', graph);
});
```

---

### Editor API

#### logseq.Editor.getCurrentBlock()

**설명**: 현재 편집 중인 블록을 가져옵니다.

**시그니처**:
```typescript
getCurrentBlock(): Promise<BlockEntity | null>
```

**반환값**: 현재 블록 엔티티 또는 null

**예제**:
```typescript
const block = await logseq.Editor.getCurrentBlock();
if (block) {
    console.log('Current block:', block.content);
    console.log('Block UUID:', block.uuid);
}
```

---

#### logseq.Editor.getCurrentPage()

**설명**: 현재 페이지를 가져옵니다.

**시그니처**:
```typescript
getCurrentPage(): Promise<PageEntity | BlockEntity | null>
```

**반환값**: 현재 페이지 엔티티 또는 null

**예제**:
```typescript
const page = await logseq.Editor.getCurrentPage();
if (page) {
    console.log('Current page:', page.name || page.originalName);
}
```

---

#### logseq.Editor.insertBlock()

**설명**: 블록을 삽입합니다.

**시그니처**:
```typescript
insertBlock(
    srcBlock: BlockIdentity,
    content: string,
    opts?: Partial<{
        before: boolean;
        sibling: boolean;
        isPageBlock: boolean;
        focus: boolean;
        customUUID: string;
        properties: {};
    }>
): Promise<BlockEntity | null>
```

**매개변수**:
- `srcBlock`: 기준 블록 UUID 또는 블록 엔티티
- `content`: 삽입할 블록 내용
- `opts`: 옵션
  - `before`: 기준 블록 앞에 삽입 (기본값: false, 뒤에 삽입)
  - `sibling`: 형제 블록으로 삽입 (기본값: false, 자식으로 삽입)
  - `focus`: 삽입 후 포커스 (기본값: false)
  - `properties`: 블록 속성 객체

**반환값**: 생성된 블록 엔티티 또는 null

**예제**:
```typescript
const currentBlock = await logseq.Editor.getCurrentBlock();
if (currentBlock) {
    await logseq.Editor.insertBlock(currentBlock.uuid, 'New block content', {
        before: false,
        focus: true,
    });
}
```

---

#### logseq.Editor.updateBlock()

**설명**: 블록 내용을 업데이트합니다.

**시그니처**:
```typescript
updateBlock(
    srcBlock: BlockIdentity,
    content: string,
    opts?: Partial<{ properties: {} }>
): Promise<void>
```

**예제**:
```typescript
const block = await logseq.Editor.getCurrentBlock();
if (block) {
    await logseq.Editor.updateBlock(block.uuid, 'Updated content');
}
```

---

### UI 유틸리티 API

#### logseq.UI.showMsg()

**설명**: 사용자에게 메시지를 표시합니다.

**시그니처**:
```typescript
showMsg(
    content: string,
    status?: 'success' | 'warning' | 'error' | string,
    opts?: Partial<UIMsgOptions>
): Promise<UIMsgKey>
```

**매개변수**:
- `content`: 표시할 메시지
- `status`: 메시지 타입 (`'success'`, `'warning'`, `'error'` 또는 커스텀 문자열)
- `opts`: 옵션
  - `key`: 메시지의 고유 키
  - `timeout`: 자동 닫기 시간(ms)

**반환값**: 메시지 키 (나중에 닫을 때 사용)

**예제**:
```typescript
// 성공 메시지
await logseq.UI.showMsg('Operation completed!', 'success');

// 에러 메시지
await logseq.UI.showMsg('Something went wrong!', 'error');

// 커스텀 타임아웃
const msgKey = await logseq.UI.showMsg('This will close in 5 seconds', 'info', {
    timeout: 5000,
});

// 메시지 수동 닫기
logseq.UI.closeMsg(msgKey);
```

---

### 설정 API

#### logseq.useSettingsSchema()

**설명**: 플러그인 설정 스키마를 정의합니다.

**시그니처**:
```typescript
useSettingsSchema(schemas: Array<SettingSchemaDesc>): this
```

**매개변수**:
- `schemas`: 설정 스키마 배열
  - `key`: 설정 키
  - `type`: 설정 타입 (`'string'`, `'number'`, `'boolean'`, `'enum'`, `'object'`, `'heading'`)
  - `default`: 기본값
  - `title`: 설정 제목
  - `description`: 설정 설명
  - `inputAs`: 입력 타입 (`'color'`, `'date'`, `'datetime-local'`, `'range'`, `'textarea'`)
  - `enumChoices`: enum 타입일 때 선택지 배열
  - `enumPicker`: enum 선택 UI 타입 (`'select'`, `'radio'`, `'checkbox'`)

**반환값**: `logseq` 객체 (체이닝 가능)

**예제**:
```typescript
logseq.useSettingsSchema([
    {
        key: 'apiKey',
        type: 'string',
        default: '',
        title: 'API Key',
        description: 'Enter your API key',
        inputAs: 'textarea',
    },
    {
        key: 'theme',
        type: 'enum',
        default: 'light',
        title: 'Theme',
        description: 'Choose a theme',
        enumChoices: ['light', 'dark', 'auto'],
        enumPicker: 'select',
    },
    {
        key: 'enabled',
        type: 'boolean',
        default: true,
        title: 'Enable Plugin',
        description: 'Enable or disable the plugin',
    },
]);
```

---

#### logseq.onSettingsChanged()

**설명**: 설정 변경을 감지합니다.

**시그니처**:
```typescript
onSettingsChanged<T = any>(cb: (a: T, b: T) => void): IUserOffHook
```

**예제**:
```typescript
logseq.onSettingsChanged((newSettings, oldSettings) => {
    console.log('Settings changed:', newSettings);
    // 설정 변경에 따른 처리
});
```

---

## 실전 예제

이 섹션에서는 실제 코드(`main.tsx`)를 기반으로 단계별 튜토리얼을 제공합니다.

### 예제 코드 분석

```typescript
import '@logseq/libs';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const main = () => {
    console.log('logseq-plugin-personal loaded');

    // 1단계: Main UI 스타일 설정
    logseq.setMainUIInlineStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
    });

    // 2단계: 플러그인 초기화
    logseq.ready(() => {
        console.log('Plugin ready');

        // 3단계: 툴바 버튼 등록
        logseq.App.registerUIItem('toolbar', {
            key: 'personal-plugin-toolbar',
            template: `
                <a data-on-click="togglePluginUI" class="button" title="Personal Plugin">
                    <i class="ti ti-box"></i>
                </a>
            `,
        });

        // 4단계: 명령어 등록 (단축키)
        logseq.App.registerCommand(
            'show-plugin-ui',
            {
                key: 'show-plugin-ui',
                label: 'Show Personal Plugin UI',
                keybinding: {
                    binding: 'mod+shift+p',
                },
                palette: true,
            },
            () => {
                console.log('Command executed: show-plugin-ui');
                logseq.showMainUI();
            },
        );

        // 5단계: Command Palette 등록
        logseq.App.registerCommandPalette(
            {
                key: 'toggle-plugin-ui-palette',
                label: 'Toggle Personal Plugin UI',
                keybinding: {
                    binding: 'ctrl+shift+e',
                },
            },
            () => {
                console.log('Command palette executed: toggle-plugin-ui');
                logseq.toggleMainUI();
            },
        );

        // 6단계: 이벤트 핸들러 등록
        logseq.on('ui:visible:changed', ({ visible }) => {
            console.log('UI visibility changed:', visible);
        });

        // 7단계: 모델 등록 (툴바 버튼 클릭 핸들러)
        logseq.provideModel({
            togglePluginUI() {
                console.log('Toggle UI clicked');
                logseq.toggleMainUI();
            },
        });

        // 8단계: 초기 렌더링
        renderApp();
    });
};

const renderApp = () => {
    const root_element = document.getElementById('app');
    if (root_element) {
        const root = createRoot(root_element);
        root.render(
            <StrictMode>
                <div
                    style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '400px',
                        position: 'relative',
                    }}
                >
                    <button
                        onClick={() => logseq.hideMainUI()}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        ✕
                    </button>
                    <App />
                </div>
            </StrictMode>,
        );
    }
};

// 플러그인 시작
main();
```

### 단계별 설명

#### 1단계: UI 스타일 설정

```typescript
logseq.setMainUIInlineStyle({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 999,
});
```

**목적**: 플러그인 UI를 화면 중앙에 고정 위치로 표시합니다.

**주의사항**: 
- `ready()` 호출 전에도 사용 가능합니다.
- CSS 속성은 camelCase 형식으로 작성해야 합니다.

#### 2단계: 플러그인 초기화

```typescript
logseq.ready(() => {
    // 초기화 코드
});
```

**목적**: LogSeq가 플러그인을 실행할 준비가 되었을 때 초기화 코드를 실행합니다.

**주의사항**: 
- 대부분의 LogSeq API는 `ready()` 콜백 내부에서만 사용 가능합니다.
- 비동기 작업도 이 콜백 내부에서 처리할 수 있습니다.

#### 3단계: 툴바 버튼 등록

```typescript
logseq.App.registerUIItem('toolbar', {
    key: 'personal-plugin-toolbar',
    template: `
        <a data-on-click="togglePluginUI" class="button" title="Personal Plugin">
            <i class="ti ti-box"></i>
        </a>
    `,
});
```

**목적**: LogSeq 툴바에 플러그인 버튼을 추가합니다.

**주의사항**: 
- `data-on-click` 속성의 값은 `provideModel()`로 등록한 메서드 이름과 일치해야 합니다.
- Tabler Icons (`ti ti-*`) 클래스를 사용할 수 있습니다.

#### 4단계: 명령어 등록

```typescript
logseq.App.registerCommand(
    'show-plugin-ui',
    {
        key: 'show-plugin-ui',
        label: 'Show Personal Plugin UI',
        keybinding: {
            binding: 'mod+shift+p',
        },
        palette: true,
    },
    () => {
        logseq.showMainUI();
    },
);
```

**목적**: 단축키(`Cmd/Ctrl+Shift+P`)로 플러그인 UI를 열 수 있게 합니다.

**주의사항**: 
- `palette: true`로 설정하면 명령 팔레트에도 표시됩니다.
- 단축키 충돌을 피하기 위해 고유한 조합을 사용하세요.

#### 5단계: Command Palette 등록

```typescript
logseq.App.registerCommandPalette(
    {
        key: 'toggle-plugin-ui-palette',
        label: 'Toggle Personal Plugin UI',
        keybinding: {
            binding: 'ctrl+shift+e',
        },
    },
    () => {
        logseq.toggleMainUI();
    },
);
```

**목적**: 명령 팔레트를 통한 플러그인 접근을 제공합니다.

#### 6단계: 이벤트 핸들러 등록

```typescript
logseq.on('ui:visible:changed', ({ visible }) => {
    console.log('UI visibility changed:', visible);
});
```

**목적**: UI 표시 상태 변경을 감지하여 필요한 작업을 수행합니다.

#### 7단계: 모델 등록

```typescript
logseq.provideModel({
    togglePluginUI() {
        logseq.toggleMainUI();
    },
});
```

**목적**: UI 템플릿에서 호출할 수 있는 메서드를 제공합니다.

**주의사항**: 
- `provideModel()`은 `ready()` 호출 전에도 사용 가능합니다.
- 모델 메서드는 비동기 함수일 수 있습니다.

#### 8단계: React 앱 렌더링

```typescript
const renderApp = () => {
    const root_element = document.getElementById('app');
    if (root_element) {
        const root = createRoot(root_element);
        root.render(
            <StrictMode>
                <div>
                    {/* 플러그인 UI */}
                </div>
            </StrictMode>,
        );
    }
};
```

**목적**: React 컴포넌트를 렌더링하여 플러그인 UI를 표시합니다.

**주의사항**: 
- `index.html`에 `<div id="app"></div>` 요소가 있어야 합니다.
- React 18+의 `createRoot` API를 사용합니다.

---

## 트러블슈팅

### 일반적인 문제

#### 1. 플러그인이 로드되지 않음

**증상**: 플러그인이 LogSeq에 표시되지 않거나 오류가 발생합니다.

**해결 방법**:
- `package.json`의 `logseq` 설정이 올바른지 확인
- `main` 경로가 올바른지 확인 (`dist/index.html`)
- 빌드가 완료되었는지 확인
- LogSeq 개발자 도구에서 오류 확인

#### 2. `logseq` 객체가 undefined

**증상**: `logseq is not defined` 오류 발생

**해결 방법**:
```typescript
// 반드시 import 문을 최상단에 추가
import '@logseq/libs';
```

#### 3. API 호출이 작동하지 않음

**증상**: LogSeq API 호출이 실패하거나 아무 동작도 하지 않음

**해결 방법**:
- `logseq.ready()` 콜백 내부에서 호출하는지 확인
- 비동기 API는 `await`를 사용하는지 확인
- API 호출 전에 필요한 권한이 있는지 확인

#### 4. UI가 표시되지 않음

**증상**: `showMainUI()` 호출 후 UI가 보이지 않음

**해결 방법**:
- `index.html`에 올바른 root 요소가 있는지 확인
- `renderApp()` 함수가 호출되었는지 확인
- CSS 스타일이 UI를 가리는지 확인
- `zIndex` 값이 충분히 높은지 확인

#### 5. 단축키가 작동하지 않음

**증상**: 등록한 단축키가 반응하지 않음

**해결 방법**:
- 단축키 형식이 올바른지 확인 (`mod+shift+p`)
- 다른 플러그인과 충돌하는지 확인
- LogSeq 설정에서 단축키 확인
- `mode` 옵션 확인 (`'global'`, `'non-editing'`, `'editing'`)

#### 6. `data-on-click` 핸들러가 작동하지 않음

**증상**: UI 버튼 클릭 시 아무 동작도 하지 않음

**해결 방법**:
- `provideModel()`로 메서드를 등록했는지 확인
- 메서드 이름이 `data-on-click` 값과 일치하는지 확인
- `ready()` 콜백 내부에서 `provideModel()`을 호출했는지 확인

#### 7. React 컴포넌트가 렌더링되지 않음

**증상**: React 앱이 표시되지 않음

**해결 방법**:
- `index.html`에 `<div id="app"></div>` 요소 확인
- `renderApp()` 함수가 호출되었는지 확인
- React와 ReactDOM 버전 호환성 확인
- 브라우저 콘솔에서 오류 확인

### 디버깅 팁

1. **콘솔 로그 활용**
   ```typescript
   console.log('Plugin loaded');
   console.log('Current block:', await logseq.Editor.getCurrentBlock());
   ```

2. **LogSeq 개발자 도구 사용**
   - LogSeq에서 `Ctrl+Shift+I` (Windows/Linux) 또는 `Cmd+Option+I` (Mac)
   - 콘솔 탭에서 플러그인 로그 확인

3. **타입 체크**
   ```typescript
   // TypeScript로 타입 안전성 확보
   const block = await logseq.Editor.getCurrentBlock();
   if (block) {
       // block은 BlockEntity 타입
   }
   ```

4. **에러 핸들링**
   ```typescript
   try {
       await logseq.Editor.insertBlock(uuid, content);
   } catch (error) {
       console.error('Failed to insert block:', error);
       await logseq.UI.showMsg('Failed to insert block', 'error');
   }
   ```

---

## FAQ

### Q1: 플러그인을 어떻게 배포하나요?

**A**: LogSeq 플러그인은 npm 패키지로 배포할 수 있습니다. `package.json`에 필요한 메타데이터를 추가하고 npm에 게시하면 됩니다. 사용자는 LogSeq 내에서 플러그인을 검색하고 설치할 수 있습니다.

### Q2: React 외에 다른 프레임워크를 사용할 수 있나요?

**A**: 네, 가능합니다. Vue, Svelte, 또는 순수 JavaScript를 사용할 수 있습니다. LogSeq 플러그인은 HTML/CSS/JavaScript만 필요로 하므로 어떤 프레임워크도 사용 가능합니다.

### Q3: 플러그인에서 외부 API를 호출할 수 있나요?

**A**: 네, 가능합니다. `fetch` API나 `logseq.Request`를 사용하여 외부 API를 호출할 수 있습니다. CORS 정책에 주의하세요.

### Q4: 플러그인 데이터를 저장할 수 있나요?

**A**: 네, `logseq.FileStorage`를 사용하여 플러그인 데이터를 저장할 수 있습니다. 로컬 스토리지와 유사한 API를 제공합니다.

### Q5: 플러그인 간 통신이 가능한가요?

**A**: 네, `logseq.App.invokeExternalPlugin()`을 사용하여 다른 플러그인의 명령어나 모델을 호출할 수 있습니다.

### Q6: 블록을 프로그래밍 방식으로 생성할 수 있나요?

**A**: 네, `logseq.Editor.insertBlock()` 또는 `logseq.Editor.insertBatchBlock()`을 사용하여 블록을 생성할 수 있습니다.

### Q7: 현재 페이지의 모든 블록을 가져올 수 있나요?

**A**: 네, `logseq.Editor.getCurrentPageBlocksTree()`를 사용하여 현재 페이지의 모든 블록을 트리 구조로 가져올 수 있습니다.

### Q8: 플러그인 설정을 사용자에게 제공할 수 있나요?

**A**: 네, `logseq.useSettingsSchema()`를 사용하여 설정 스키마를 정의하고, `logseq.showSettingsUI()`로 설정 UI를 표시할 수 있습니다.

### Q9: 다크 모드/라이트 모드를 감지할 수 있나요?

**A**: 네, `logseq.App.onThemeModeChanged()`를 사용하여 테마 모드 변경을 감지할 수 있습니다.

### Q10: 플러그인을 개발 모드로 테스트하려면?

**A**: LogSeq의 플러그인 개발 모드를 사용하거나, 로컬에서 빌드한 후 LogSeq의 플러그인 폴더에 심볼릭 링크를 생성하여 테스트할 수 있습니다.

---

## 추가 리소스

### 공식 문서
- [LogSeq 플러그인 문서](https://plugins-doc.logseq.com/)
- [API 레퍼런스](https://logseq.github.io/plugins/)
- [샘플 코드](https://github.com/logseq/logseq-plugin-samples)

### 커뮤니티
- [LogSeq Discord](https://discord.gg/logseq)
- [GitHub Discussions](https://github.com/logseq/logseq/discussions)

### 유용한 링크
- [Tabler Icons](https://tabler.io/icons) - UI 아이콘
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [React 문서](https://react.dev/)

---

**작성일**: 2026-01-28  
**최종 업데이트**: 2026-01-28  
**버전**: 1.0.0
