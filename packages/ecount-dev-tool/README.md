# EC Server Manager

ecount.com 개발 환경 관리를 위한 Chrome Extension입니다.

## 기술 스택

- **Framework**: Svelte 5 (Runes API)
- **Build Tool**: Vite 7 + vite-plugin-web-extension
- **Language**: TypeScript
- **Styling**: vanilla-extract (via @personal/uikit)
- **UI Components**: @personal/uikit (Monorepo 공유 패키지)

## 주요 기능

### 1. 빠른 로그인 (Quick Login)
- 사전 설정된 계정으로 빠른 로그인
- 회사코드, 아이디, 비밀번호 자동 입력

### 2. 서버 환경 전환
- **EC5 (v5 + v3)**: 개발 서버 간 전환 (test, zeus01-99, ba1-3, lxba1-3 등)
- **EC3**: zeus 서버 전환
- **Stage**: stage1-4 서버 전환
- Select/Text Input 전환 지원 (커스텀 서버 입력 가능)

### 3. URL 파싱 및 빌드
- ecount.com URL 자동 분석
- 서버 전환 시 올바른 URL 생성

## 개발

### 의존성 설치
```bash
pnpm install
```

### 개발 모드 (HMR)
```bash
cd packages/ecount-dev-tool
pnpm dev
```

### 빌드
```bash
pnpm build
```

빌드 결과물: `dist/` 디렉토리

### Chrome에 로드
1. Chrome 주소창에 `chrome://extensions/` 입력
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `dist/` 폴더 선택

## 프로젝트 구조

```
src/
├── components/          # Svelte 컴포넌트
│   ├── App/            # 루트 컴포넌트
│   ├── QuickLoginSection/
│   ├── ServerManager/
│   ├── StageManager/
│   └── ActionBar/
├── services/           # 비즈니스 로직
│   ├── url_service.ts  # URL 파싱/빌드
│   ├── tab_service.ts  # Chrome Tab API
│   └── page_actions.ts # Content Script 함수
├── stores/             # Svelte Store (Runes)
│   └── current_tab.svelte.ts
├── types/              # TypeScript 타입
│   └── server.ts
├── constants/          # 상수
│   └── servers.ts
├── test/               # 테스트 헬퍼 및 통합 테스트
│   ├── mock_helpers.ts
│   └── integration/
├── manifest.json       # Chrome Extension Manifest
├── popup.html          # Popup HTML
└── popup.ts            # Entry Point
```

### 경로 별칭 (Subpath Imports)

Node.js subpath imports (`#`)를 사용하여 내부 모듈을 참조합니다:

```typescript
import { buildEc5Url } from '#services/url_service';
import { getTabState } from '#stores/current_tab.svelte';
import type { ParsedUrl } from '#types/server';
```

`package.json`의 `imports` 필드와 `tsconfig.json`의 `paths`에서 동기화됩니다.

## 아키텍처 특징

### Monorepo 구조
- `@personal/uikit`: 공유 UI 컴포넌트 라이브러리
  - Svelte 5 컴포넌트
  - vanilla-extract 기반 스타일링
  - 프레임워크 분리 가능한 디자인 레이어 (`/design` export)

### 타입 안정성
- 모든 비즈니스 로직 TypeScript로 작성
- Chrome Extension API 타입 지원 (`@types/chrome`)
- 엄격한 타입 체크로 런타임 오류 방지

### 도메인 기반 모듈 분리
- 기존 `serverChange.js` (488줄)의 중복 로직을 도메인별로 분리
- URL 파싱/빌드 로직 중앙화 (`services/url_service.ts`)
- Content Script 함수 독립적 관리 (`services/page_actions.ts`)
- Chrome Tab API 래퍼 (`services/tab_service.ts`)

### 컴포넌트 기반 아키텍처
- Svelte 5 Runes API 사용
- 재사용 가능한 컴포넌트 구조
- 상태 관리: Svelte 5 Runes (`stores/current_tab.svelte.ts`)

## API 문서

### Services

#### `url_service.ts`

URL 파싱 및 빌드 유틸리티 함수입니다.

##### `parseEcountUrl(url_string: string): ParsedUrl | null`

ecount.com URL을 파싱하여 환경 정보를 추출합니다.

```typescript
import { parseEcountUrl } from '#services/url_service';

const parsed = parseEcountUrl('https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1');
// {
//   environment: 'zeus',
//   page_type: 'ec5',
//   current_server: 'zeus01',
//   v5_domain: 'zeus01',
//   v3_domain: 'ba1',
//   zeus_number: '01',
//   url: URL {...}
// }
```

##### `buildEc5Url(current_url: URL, to_v5_server: string, to_v3_server: string): string`

EC5 URL을 생성합니다.

##### `buildEc3Url(current_url: URL, to_v3_server: string, to_v5_server: string): string`

EC3 (ECP050M) URL을 생성합니다.

##### `buildStageUrl(current_url: URL): string | null`

Stage 서버 전환 URL을 생성합니다.

##### `getStageButtonLabel(url: URL): string`

Stage 전환 버튼의 라벨을 결정합니다.

##### `buildDevUrl(current_url: URL, page_info: PageInfo): URL`

devMode(disableMin) URL을 생성합니다.

---

#### `tab_service.ts`

Chrome Tab API 래퍼 함수입니다.

##### `getCurrentTab(): Promise<chrome.tabs.Tab | null>`

현재 활성화된 탭을 가져옵니다.

##### `updateTabUrl(tab_id: number, url: string): Promise<void>`

탭의 URL을 업데이트하고 popup을 닫습니다.

##### `executeScript(tab_id: number, func: (...args: any[]) => any, args?: any[]): Promise<any>`

탭에서 content script를 실행합니다 (ISOLATED world).

##### `executeMainWorldScript<T>(tab_id: number, func: () => T): Promise<T | null>`

MAIN world에서 content script를 실행합니다. 페이지의 JS 변수에 접근할 때 사용합니다.

---

#### `page_actions.ts`

Content Script로 실행되는 페이지 액션 함수입니다.

##### `inputLogin(key: string, value: string): void`

로그인 화면에 값을 입력합니다.

##### `switchV3TestServer(): void`

3.0 서버를 로컬로 변경합니다.

##### `switchV5TestServer(): void`

5.0 서버를 로컬로 변경합니다.

##### `debugAndGetPageInfo(): PageInfo`

페이지 정보를 조회합니다 (MAIN world에서 실행).

---

### Stores

#### `current_tab.svelte.ts`

현재 탭 정보를 관리하는 Svelte 5 Runes 기반 스토어입니다.

```typescript
import { initializeTabState, getTabState, isSupported } from '#stores/current_tab.svelte';

// popup 초기화 시 호출
await initializeTabState();

// 상태 읽기 ($derived와 함께 사용)
const tab = $derived(getTabState());
// → { url, tab_id, parsed, is_stage, is_loading }

const supported = $derived(isSupported());
// → true (ecount.com 도메인인 경우)
```

---

### Types

#### `server.ts`

```typescript
type Environment = 'test' | 'zeus' | 'stage' | 'unknown';
type PageType = 'ec5' | 'ec3' | 'stage' | 'unknown';

interface ParsedUrl {
  environment: Environment;
  page_type: PageType;
  current_server: string;
  v5_domain: string;
  v3_domain: string;
  zeus_number?: string;
  url: URL;
}

interface ServerConfig {
  v5_domain: string;
  v3_domain: string;
}

interface LoginAccount {
  company: string;
  id: string;
  password: string;
}

interface PageInfo {
  hasSetDevMode: boolean;
  hasECountApp: boolean;
  hasGetContext: boolean;
  hasConfig: boolean;
  zoneNum: string;
  error: string | null;
}

interface TabState {
  url: string;
  tab_id: number;
  parsed: ParsedUrl | null;
  is_stage: boolean;
  is_loading: boolean;
}
```

## 테스트

### 단위 테스트 (Vitest)

서비스, 스토어, 통합 테스트는 Vitest로 실행합니다:

```bash
pnpm test
```

- `services/url_service.test.ts` - URL 파싱/빌드 (31개)
- `services/tab_service.test.ts` - Chrome Tab API (12개)
- `services/page_actions.test.ts` - 페이지 액션 (13개)
- `stores/current_tab.svelte.test.ts` - 탭 상태 관리 (6개)
- `test/integration/` - 통합 테스트 (10개)

### Storybook

UI 컴포넌트의 시각적 테스트와 인터랙션 테스트는 Storybook play function으로 수행합니다:

```bash
# 루트에서 실행
pnpm storybook
```

스토리 파일은 `.stories.ts` (CSF3 포맷)으로 작성되며, children이 필요한 컴포넌트는 `*StoryWrapper.svelte`를 사용합니다.

## 버전 히스토리

- **v2.3.0**: Storybook CSF3 마이그레이션, subpath imports (`#`) 전환
- **v2.2.0**: TypeScript + Svelte 5 전환
- **v2.1.0**: 기존 JavaScript 버전

## 라이선스

MIT
