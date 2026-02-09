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
│   ├── PopupLayout/    # 레이아웃
│   ├── QuickLoginSection/
│   ├── EnvironmentPanel/
│   ├── ServerManager/
│   ├── StageManager/
│   └── ActionBar/
├── services/           # 비즈니스 로직
│   ├── url_service.ts  # URL 파싱/빌드
│   ├── tab_service.ts  # Chrome Tab API
│   └── page_actions.ts # Content Script 함수
├── stores/             # Svelte Store
│   └── current_tab.ts
├── types/              # TypeScript 타입
│   └── server.ts
├── constants/          # 상수
│   └── servers.ts
├── manifest.json       # Chrome Extension Manifest
├── popup.html          # Popup HTML
└── popup.ts            # Entry Point
```

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
- 상태 관리: Svelte Store (`stores/current_tab.ts`)

## API 문서

### Services

#### `url_service.ts`

URL 파싱 및 빌드 유틸리티 함수입니다.

**함수:**

##### `parseEcountUrl(url_string: string): ParsedUrl | null`

ecount.com URL을 파싱하여 환경 정보를 추출합니다.

**파라미터:**
- `url_string: string` - 파싱할 URL 문자열

**반환값:**
- `ParsedUrl | null` - 파싱된 URL 정보 또는 null (ecount.com 도메인이 아닌 경우)

**예제:**
```typescript
import { parseEcountUrl } from '@/services/url_service';

const parsed = parseEcountUrl('https://test.ecount.com/ec5/...');
// {
//   environment: 'test',
//   is_ec5: true,
//   is_ec3: false,
//   current_server: 'test',
//   v5_domain: 'test',
//   v3_domain: 'zeus01'
// }
```

##### `buildEc5Url(base_url: string, server_config: ServerConfig): string`

EC5 URL을 빌드합니다.

**파라미터:**
- `base_url: string` - 기본 URL
- `server_config: ServerConfig` - 서버 설정 객체

**반환값:**
- `string` - 빌드된 URL

**예제:**
```typescript
import { buildEc5Url } from '@/services/url_service';

const newUrl = buildEc5Url('https://test.ecount.com/ec5/...', {
  v5_domain: 'zeus01',
  v3_domain: 'zeus01'
});
```

##### `buildEc3Url(base_url: string, v3_domain: string): string`

EC3 URL을 빌드합니다.

**파라미터:**
- `base_url: string` - 기본 URL
- `v3_domain: string` - V3 도메인

**반환값:**
- `string` - 빌드된 URL

#### `tab_service.ts`

Chrome Tab API 래퍼 함수입니다.

**함수:**

##### `getCurrentTab(): Promise<chrome.tabs.Tab | null>`

현재 활성화된 탭을 가져옵니다.

**반환값:**
- `Promise<chrome.tabs.Tab | null>` - 현재 탭 또는 null

##### `updateTabUrl(tab_id: number, url: string): Promise<void>`

탭의 URL을 업데이트합니다.

**파라미터:**
- `tab_id: number` - 탭 ID
- `url: string` - 새로운 URL

##### `executeScript(tab_id: number, func: () => void): Promise<void>`

탭에 스크립트를 실행합니다.

**파라미터:**
- `tab_id: number` - 탭 ID
- `func: () => void` - 실행할 함수

##### `getCurrentTabUrl(): Promise<string | null>`

현재 탭의 URL을 가져옵니다.

**반환값:**
- `Promise<string | null>` - 현재 탭의 URL 또는 null

#### `page_actions.ts`

Content Script에서 사용할 페이지 액션 함수입니다.

**함수:**

##### `fillInput(selector: string, value: string): void`

입력 필드에 값을 채웁니다.

**파라미터:**
- `selector: string` - CSS 선택자
- `value: string` - 입력할 값

##### `clickButton(selector: string): void`

버튼을 클릭합니다.

**파라미터:**
- `selector: string` - CSS 선택자

##### `selectOption(selector: string, value: string): void`

Select 요소의 옵션을 선택합니다.

**파라미터:**
- `selector: string` - CSS 선택자
- `value: string` - 선택할 값

### Stores

#### `current_tab.ts`

현재 탭 정보를 관리하는 Svelte Store입니다.

**사용법:**
```typescript
import { current_tab } from '@/stores/current_tab';

// Store 값 읽기
$current_tab.url;

// Store 업데이트
current_tab.set({ url: 'https://...', id: 123 });
```

### Types

#### `server.ts`

서버 관련 타입 정의입니다.

**타입:**

```typescript
interface ParsedUrl {
  environment: 'test' | 'zeus' | 'stage';
  is_ec5: boolean;
  is_ec3: boolean;
  current_server: string;
  v5_domain: string;
  v3_domain: string;
  zeus_number?: string;
}

interface ServerConfig {
  v5_domain: string;
  v3_domain: string;
}
```

## 버전 히스토리

- **v2.2.0**: TypeScript + Svelte 5 전환
- **v2.1.0**: 기존 JavaScript 버전

## 라이선스

MIT
