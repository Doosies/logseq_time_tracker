# ecount dev tool 설정 동기화 및 첫 설치 복원 - 설계 문서

## 1. 개요

ecount dev tool(Chrome Extension)의 설정을 크로스 디바이스로 자동 동기화하고, 첫 설치 시 사용자가 백업 파일을 선택하여 설정을 복원할 수 있는 기능을 추가한다.

### 1.1 현재 상태

| 스토어 | 저장소 | 크로스 디바이스 동기화 |
|--------|--------|:---:|
| accounts, active_account | chrome.storage.sync | O |
| section_order, section_visibility | chrome.storage.sync | O |
| theme | localStorage | X |
| preferences | localStorage | X |
| user_scripts | chrome.storage.local | X |

### 1.2 목표

- **기능 A**: theme, preferences를 `chrome.storage.sync`로 마이그레이션하여 같은 구글 계정의 다른 PC에서 자동 동기화
- **기능 B**: 첫 설치 시 파일 선택 UI를 표시하여 사용자가 백업 JSON 파일에서 설정 복원 (주로 user_scripts 복원 목적)

### 1.3 제약사항

- `chrome.storage.sync` 제한: 항목당 8KB, 총 100KB → user_scripts는 sync 불가
- 크롬 익스텐션은 로컬 파일 시스템 직접 접근 불가 → 파일 선택은 사용자 제스처 필요
- 테마는 마운트 전 적용해야 FOUC(Flash of Unstyled Content)를 방지할 수 있음

---

## 2. 기능 A: chrome.storage.sync 마이그레이션

### 2.1 theme 스토어 변경

**파일**: `src/stores/theme.svelte.ts`

#### 2.1.1 API 변경

| 기존 API | 변경 후 | 비고 |
|----------|---------|------|
| `initializeTheme(): void` | `initializeThemeSync(): void` (새 이름) | 동기 함수, FOUC 방지용, localStorage에서 읽기 |
| (없음) | `initializeTheme(): Promise<void>` (새 함수) | async, chrome.storage.sync에서 읽기 + 마이그레이션 |
| `setTheme(theme): void` | `setTheme(theme): Promise<void>` | async로 변경, sync + localStorage 모두 저장 |
| `resetTheme(): void` | `resetTheme(): Promise<void>` | async로 변경, sync + localStorage 모두 제거 |
| `getTheme(): Theme` | (변경 없음) | |

#### 2.1.2 상세 구현 명세

```typescript
import { light_theme, dark_theme } from '@personal/uikit/design';

const STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark' | 'auto';

let current_theme = $state<Theme>('auto');
let media_query: MediaQueryList | null = null;

// --- 기존 유지 (변경 없음) ---

function applyTheme(): void {
    // 기존 코드 그대로 유지
}

function handleSystemPreferenceChange(): void {
    // 기존 코드 그대로 유지
}

function isValidTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark' || value === 'auto';
}

function setupMediaQuery(): void {
    if (typeof window === 'undefined') return;
    media_query = window.matchMedia('(prefers-color-scheme: dark)');
    media_query.addEventListener('change', handleSystemPreferenceChange);
}

// --- 변경 함수들 ---

/**
 * 동기적 테마 초기화. popup.ts/editor.ts에서 마운트 전 호출하여 FOUC를 방지한다.
 * localStorage에서 읽어 즉시 적용한다.
 */
export function initializeThemeSync(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(stored)) {
        current_theme = stored;
    }

    applyTheme();
}

/**
 * 비동기 테마 초기화. App.svelte onMount에서 호출한다.
 * chrome.storage.sync에서 읽어 최종 테마를 확정하고,
 * localStorage에만 있는 값은 sync로 마이그레이션한다.
 */
export async function initializeTheme(): Promise<void> {
    try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        const synced = result[STORAGE_KEY];

        if (isValidTheme(synced)) {
            current_theme = synced;
            applyTheme();
            // sync 값을 localStorage 캐시에도 반영
            localStorage.setItem(STORAGE_KEY, synced);
        } else {
            // 마이그레이션: localStorage에만 값이 있으면 sync로 이관
            const local = localStorage.getItem(STORAGE_KEY);
            if (isValidTheme(local)) {
                await chrome.storage.sync.set({ [STORAGE_KEY]: local });
            }
        }
    } catch {
        // sync 실패 시 localStorage 값 유지 (initializeThemeSync에서 이미 적용됨)
    }

    setupMediaQuery();
}

export function getTheme(): Theme {
    return current_theme;
}

/**
 * 테마 변경. sync + localStorage 모두 저장한다.
 * localStorage는 다음 실행 시 initializeThemeSync()에서 FOUC 방지용 캐시로 사용.
 */
export async function setTheme(theme: Theme): Promise<void> {
    current_theme = theme;
    applyTheme();

    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, theme);
    }

    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: theme });
    } catch {
        // sync 저장 실패해도 localStorage에는 저장됨
    }
}

export async function resetTheme(): Promise<void> {
    current_theme = 'auto';
    if (media_query) {
        media_query.removeEventListener('change', handleSystemPreferenceChange);
        media_query = null;
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: 'auto' });
    } catch {
        // 무시
    }
    applyTheme();
}
```

#### 2.1.3 초기화 흐름

```
popup.ts (마운트 전)
  └─ initializeThemeSync()        ← 동기, localStorage에서 읽어 즉시 body class 적용
      └─ mount(App, ...)

App.svelte onMount
  └─ await initializeTheme()      ← async, sync에서 읽어 확정 + 마이그레이션
```

### 2.2 preferences 스토어 변경

**파일**: `src/stores/preferences.svelte.ts`

#### 2.2.1 API 변경

| 기존 API | 변경 후 | 비고 |
|----------|---------|------|
| `initializePreferences(): void` | `initializePreferences(): Promise<void>` | async로 변경, sync에서 읽기 + 마이그레이션 |
| `setEnableAnimations(enabled): Promise<void>` | (시그니처 동일) | sync + localStorage 모두 저장 |
| `restorePreferences(prefs): Promise<boolean>` | (시그니처 동일) | sync + localStorage 모두 저장 |
| `resetPreferences(): void` | `resetPreferences(): Promise<void>` | async로 변경 |
| `getPreferences(): Preferences` | (변경 없음) | |

#### 2.2.2 상세 구현 명세

```typescript
interface Preferences {
    enable_animations: boolean;
}

const STORAGE_KEY = 'user_preferences';
const DEFAULTS: Preferences = { enable_animations: true };

let preferences = $state<Preferences>({ ...DEFAULTS });

function isValidPreferences(value: unknown): value is Partial<Preferences> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * chrome.storage.sync에서 읽기 → localStorage 마이그레이션 → 적용.
 * sync에 값이 없고 localStorage에 있으면 sync로 이관한다.
 */
export async function initializePreferences(): Promise<void> {
    try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        const synced = result[STORAGE_KEY];

        if (isValidPreferences(synced)) {
            preferences = { ...DEFAULTS, ...synced };
            // sync 값을 localStorage 캐시에도 반영
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } else {
            // 마이그레이션: localStorage에만 값이 있으면 sync로 이관
            const local_raw = localStorage.getItem(STORAGE_KEY);
            if (local_raw) {
                try {
                    const local_parsed = JSON.parse(local_raw) as Partial<Preferences>;
                    preferences = { ...DEFAULTS, ...local_parsed };
                    await chrome.storage.sync.set({ [STORAGE_KEY]: preferences });
                } catch {
                    // 잘못된 JSON은 무시, 기본값 유지
                }
            }
        }
    } catch {
        // sync 실패 시 localStorage fallback
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                preferences = { ...DEFAULTS, ...(JSON.parse(stored) as Partial<Preferences>) };
            }
        } catch {
            // 기본값 유지
        }
    }
}

export function getPreferences(): Preferences {
    return preferences;
}

/**
 * 애니메이션 설정 변경. sync + localStorage 모두 저장.
 */
export async function setEnableAnimations(enabled: boolean): Promise<void> {
    preferences = { ...preferences, enable_animations: enabled };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: $state.snapshot(preferences) });
    } catch {
        // sync 실패해도 localStorage에는 저장됨
    }
}

export async function resetPreferences(): Promise<void> {
    preferences = { ...DEFAULTS };
    localStorage.removeItem(STORAGE_KEY);
    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULTS });
    } catch {
        // 무시
    }
}

export async function restorePreferences(new_prefs: Partial<Preferences>): Promise<boolean> {
    try {
        preferences = { ...DEFAULTS, ...new_prefs };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        await chrome.storage.sync.set({ [STORAGE_KEY]: $state.snapshot(preferences) });
        return true;
    } catch (e) {
        console.error('설정 복원 실패:', e);
        return false;
    }
}
```

### 2.3 popup.ts 변경

**파일**: `src/popup.ts`

```typescript
import { mount } from 'svelte';
import '@personal/uikit/design';
import { initializeThemeSync } from './stores/theme.svelte';
import App from './components/App';

// 동기적 테마 초기화 (FOUC 방지)
initializeThemeSync();

const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app;
```

- `initializeTheme()` → `initializeThemeSync()`로 변경 (함수명만 변경, 동기 동작 유지)

### 2.4 editor.ts 변경

**파일**: `src/editor.ts`

```typescript
import { mount } from 'svelte';
import '@personal/uikit/design';
import { initializeThemeSync } from './stores/theme.svelte';
import { initializeUserScripts } from './stores/user_scripts.svelte';
import EditorPage from '#components/EditorPage';

// 동기적 테마 초기화 (FOUC 방지)
initializeThemeSync();

await initializeUserScripts();

const app = mount(EditorPage, {
    target: document.getElementById('app')!,
});

export default app;
```

### 2.5 backup_service.ts 변경

**파일**: `src/services/backup_service.ts`

`setTheme()`이 async로 변경되므로 `importAllSettings`에서 호출부 수정:

```typescript
// 기존
if (data.theme !== undefined) {
    if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'auto') {
        setTheme(data.theme);
    }
}

// 변경
if (data.theme !== undefined) {
    if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'auto') {
        await setTheme(data.theme);
    }
}
```

---

## 3. 기능 B: 첫 설치 파일 선택 가져오기

### 3.1 setup_state 스토어 (신규)

**파일**: `src/stores/setup_state.svelte.ts` (신규 생성)

```typescript
const STORAGE_KEY = 'setup_completed';

let is_first_launch = $state(false);

/**
 * chrome.storage.local에서 setup_completed 플래그를 확인한다.
 * 플래그가 없으면 첫 설치로 판단한다.
 */
export async function initializeSetupState(): Promise<void> {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        is_first_launch = !result[STORAGE_KEY];
    } catch {
        is_first_launch = false;
    }
}

export function isFirstLaunch(): boolean {
    return is_first_launch;
}

/**
 * 설정 완료 표시. 가져오기 완료 또는 건너뛰기 시 호출한다.
 */
export async function markSetupCompleted(): Promise<void> {
    is_first_launch = false;
    try {
        await chrome.storage.local.set({ [STORAGE_KEY]: true });
    } catch {
        // 저장 실패해도 현재 세션에서는 false로 유지
    }
}

/**
 * 테스트용 리셋 함수.
 */
export function resetSetupState(): void {
    is_first_launch = false;
}
```

- `chrome.storage.local` 사용 (sync 아님 — 각 기기별 독립적으로 첫 설치 감지)
- 에러 시 `is_first_launch = false` (안전한 기본값: 가져오기 UI를 표시하지 않음)

### 3.2 App.svelte 변경

**파일**: `src/components/App/App.svelte`

#### 3.2.1 script 블록 변경

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, Dnd, Toast } from '@personal/uikit';
    import { StageManager } from '#components/StageManager';
    import { SectionSettings } from '#components/SectionSettings';
    import { SECTION_REGISTRY, getSectionById } from '#sections';
    import { initializeTabState, getTabState } from '#stores/current_tab.svelte';
    import { initializeAccounts } from '#stores/accounts.svelte';
    import { initializeActiveAccount } from '#stores/active_account.svelte';
    import { initializeVisibility, isSectionVisible } from '#stores/section_visibility.svelte';
    import { initializeSectionOrder, getSectionOrder, setSectionOrder } from '#stores/section_order.svelte';
    import { initializeUserScripts } from '#stores/user_scripts.svelte';
    import { initializePreferences } from '#stores/preferences.svelte';
    import { initializeTheme } from '#stores/theme.svelte';
    // ===== 추가 import =====
    import { initializeSetupState, isFirstLaunch, markSetupCompleted } from '#stores/setup_state.svelte';
    import { readBackupFile } from '#services/backup_service';

    // ... 기존 interface, derived 등 유지 ...

    // ===== 첫 설치 관련 상태 =====
    let first_launch = $derived(isFirstLaunch());
    let import_file_input: HTMLInputElement | undefined;
    let is_importing = $state(false);
    let import_result_message = $state('');

    // ===== 첫 설치 핸들러 =====
    function handleFirstLaunchImport(): void {
        import_file_input?.click();
    }

    async function handleFirstLaunchFileChange(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        is_importing = true;
        import_result_message = '';

        const result = await readBackupFile(file);
        is_importing = false;

        if (result.success) {
            import_result_message = '설정을 성공적으로 가져왔습니다!';
            await markSetupCompleted();
        } else {
            import_result_message = result.errors.join(', ') || '설정 가져오기에 실패했습니다.';
        }

        input.value = '';
    }

    async function handleSkipImport(): Promise<void> {
        await markSetupCompleted();
    }

    // ===== onMount 변경 =====
    onMount(async () => {
        await initializeSetupState();    // 추가
        await initializeTheme();         // 기존 동기 → async 변경
        initializeTabState();
        await initializeAccounts();
        await initializeActiveAccount();
        await initializeVisibility();
        await initializeSectionOrder();
        await initializeUserScripts();
        await initializePreferences();   // 기존 동기 → async 변경
    });
</script>
```

#### 3.2.2 template 블록 변경

```svelte
<Toast.Provider duration={2500}>
    <Card.Root>
        <div class="app-content">
            {#if first_launch}
                <div class="first-launch-panel">
                    <div class="first-launch-icon">
                        <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8.5 6a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.793V6z" />
                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                        </svg>
                    </div>
                    <h3 class="first-launch-title">설정 가져오기</h3>
                    <p class="first-launch-desc">
                        이전에 내보낸 설정 파일이 있다면<br />선택하여 설정을 복원할 수 있습니다.
                    </p>

                    {#if import_result_message}
                        <p class="import-result">{import_result_message}</p>
                    {/if}

                    <div class="first-launch-actions">
                        <button
                            type="button"
                            class="btn-primary"
                            onclick={handleFirstLaunchImport}
                            disabled={is_importing}
                        >
                            {is_importing ? '가져오는 중...' : '파일 선택'}
                        </button>
                        <button
                            type="button"
                            class="btn-secondary"
                            onclick={handleSkipImport}
                            disabled={is_importing}
                        >
                            건너뛰기
                        </button>
                    </div>

                    <input
                        type="file"
                        accept=".json"
                        class="hidden-input"
                        bind:this={import_file_input}
                        onchange={handleFirstLaunchFileChange}
                    />
                </div>
            {:else}
                <!-- ===== 기존 콘텐츠 그대로 =====  -->
                <SectionSettings sections={SECTION_LIST} />
                {#if tab.is_loading}
                    <!-- ... 기존 로딩 UI ... -->
                {:else if tab.is_stage}
                    <!-- ... 기존 stage UI ... -->
                {:else if is_dnd_available}
                    <!-- ... 기존 DnD UI ... -->
                {:else}
                    <!-- ... 기존 fallback UI ... -->
                {/if}
            {/if}
        </div>
    </Card.Root>
    <Toast.Root />
</Toast.Provider>
```

#### 3.2.3 스타일 추가

```css
.first-launch-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-xl) var(--space-lg);
    text-align: center;
    gap: var(--space-sm);
}

.first-launch-icon {
    color: var(--color-primary);
    margin-bottom: var(--space-sm);
}

.first-launch-title {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin: 0;
}

.first-launch-desc {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
}

.import-result {
    font-size: var(--font-size-sm);
    color: var(--color-primary);
    margin: 0;
}

.first-launch-actions {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-md);
}

.btn-primary {
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: white;
    background-color: var(--color-primary);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.btn-primary:hover:not(:disabled) {
    opacity: 0.9;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.btn-secondary:hover:not(:disabled) {
    background-color: var(--color-surface);
}

.btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.hidden-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
}
```

---

## 4. 테스트 명세

기존 테스트 패턴을 따른다:
- 테스트 환경: `src/test/setup.ts`의 chrome mock (`storage_data`, `local_storage_data`), `localStorage` polyfill
- mock 헬퍼: `src/test/mock_helpers.ts`의 `asMock()`
- 테스트 프레임워크: vitest + @testing-library/svelte + userEvent
- 테스트 설명: 한글

### 4.1 theme.svelte.test.ts 변경

기존 테스트에서 `initializeTheme()` → `initializeThemeSync()`으로 교체 (동기 테스트 유지), 새 async 테스트 추가.

#### 추가할 테스트 케이스

```
describe('initializeThemeSync', () => {
    // 기존 initializeTheme 테스트를 이 describe로 이동
    // 함수명만 initializeThemeSync으로 변경
});

describe('initializeTheme (async)', () => {
    it('chrome.storage.sync에 저장된 테마를 복원한다')
    it('sync에 값이 없고 localStorage에 있으면 sync로 마이그레이션한다')
    it('sync에 값이 있으면 localStorage 캐시도 업데이트한다')
    it('sync와 localStorage 모두 없으면 기본값 auto를 유지한다')
    it('sync 읽기 실패 시 localStorage 값을 유지한다')
    it('matchMedia change 이벤트 리스너를 등록한다')
});

describe('setTheme (async)', () => {
    it('chrome.storage.sync.set을 호출한다')
    it('localStorage에도 저장한다')
    it('sync 저장 실패해도 localStorage에는 저장된다')
    it('document.body.className을 변경한다')
});

describe('resetTheme (async)', () => {
    it('chrome.storage.sync에 auto를 저장한다')
    it('localStorage에서 테마를 제거한다')
    it('matchMedia 리스너를 제거한다')
});
```

### 4.2 preferences.svelte.test.ts 변경

기존 테스트를 async 패턴으로 변경하고 sync 관련 테스트 추가.

#### 추가/변경할 테스트 케이스

```
describe('initializePreferences (async)', () => {
    it('chrome.storage.sync에 저장된 설정을 복원한다')
    it('sync에 값이 없고 localStorage에 있으면 sync로 마이그레이션한다')
    it('sync와 localStorage 모두 없으면 기본값을 유지한다')
    it('sync 읽기 실패 시 localStorage fallback을 수행한다')
    it('잘못된 JSON이 localStorage에 있으면 기본값으로 폴백한다')
});

describe('setEnableAnimations', () => {
    it('chrome.storage.sync.set을 호출한다')
    it('localStorage에도 저장한다')
});

describe('restorePreferences', () => {
    it('chrome.storage.sync.set을 호출한다')
    it('localStorage에도 저장한다')
});

describe('resetPreferences (async)', () => {
    it('chrome.storage.sync에 기본값을 저장한다')
    it('localStorage에서 설정을 제거한다')
});
```

### 4.3 setup_state.svelte.test.ts (신규)

```
describe('setup_state store', () => {
    describe('initializeSetupState', () => {
        it('setup_completed 플래그가 없으면 isFirstLaunch()가 true를 반환한다')
        it('setup_completed 플래그가 있으면 isFirstLaunch()가 false를 반환한다')
        it('chrome.storage.local 에러 시 isFirstLaunch()가 false를 반환한다')
    });

    describe('markSetupCompleted', () => {
        it('isFirstLaunch()를 false로 변경한다')
        it('chrome.storage.local에 setup_completed: true를 저장한다')
        it('저장 실패해도 isFirstLaunch()는 false를 유지한다')
    });

    describe('resetSetupState', () => {
        it('isFirstLaunch()를 false로 초기화한다')
    });
});
```

### 4.4 App.svelte.test.ts 추가

기존 App.svelte.test.ts에 첫 설치 UI 테스트 describe 추가.

```
describe('첫 설치 가져오기', () => {
    beforeEach: setup_completed 플래그 미설정 (기본 = 첫 설치 상태)

    it('첫 설치 시 "설정 가져오기" 화면이 표시되어야 함')
        → "설정 가져오기" 제목, "파일 선택" 버튼, "건너뛰기" 버튼 확인

    it('건너뛰기 클릭 시 일반 앱 콘텐츠가 표시되어야 함')
        → 건너뛰기 클릭 → markSetupCompleted 호출
        → waitFor: 기존 섹션 설정 버튼 표시

    it('파일 선택 후 가져오기 성공 시 일반 앱으로 전환되어야 함')
        → readBackupFile mock 설정 (성공)
        → 파일 선택 트리거 → 성공 메시지 확인 → 일반 UI 전환

    it('파일 선택 후 가져오기 실패 시 에러 메시지를 표시해야 함')
        → readBackupFile mock 설정 (실패)
        → 파일 선택 트리거 → 에러 메시지 표시 → 여전히 첫 설치 화면

    it('두 번째 실행 시 첫 설치 화면이 표시되지 않아야 함')
        → setup_completed = true로 설정
        → 일반 앱 콘텐츠 바로 표시
});
```

### 4.5 backup_service.test.ts 변경

- `beforeEach`에서 `initializeTheme()` → 동기 함수 대신 async로 변경 필요
- 기존 `initializeTheme()` 호출부를 `initializeThemeSync()` + `await initializeTheme()`으로 변경
- `importAllSettings`에서 `setTheme` await 확인 (기존 테스트 구조 유지, mock은 이미 동작)

---

## 5. 데이터 흐름 다이어그램

### 5.1 기존 사용자 (마이그레이션)

```
1) popup.ts: initializeThemeSync()
   → localStorage 읽기 → body class 적용 (FOUC 방지)

2) App.svelte onMount: initializeTheme()
   → chrome.storage.sync.get('theme')
   → sync에 값 없음 → localStorage에 값 있음
   → chrome.storage.sync.set() (마이그레이션)
   → 이후 sync가 primary source

3) 사용자가 setTheme('dark') 호출
   → localStorage.setItem() + chrome.storage.sync.set()
   → 양쪽 모두 저장
```

### 5.2 새 기기에서 첫 설치

```
1) popup.ts: initializeThemeSync()
   → localStorage 비어있음 → 기본값 auto 적용

2) App.svelte onMount: initializeSetupState()
   → setup_completed 없음 → is_first_launch = true

3) App.svelte onMount: initializeTheme()
   → chrome.storage.sync.get('theme')
   → 다른 기기에서 저장한 'dark' 있음 → 적용 + localStorage 캐시

4) App.svelte: first_launch === true
   → 파일 선택 UI 표시

5) 사용자가 "파일 선택" → JSON 파일 선택
   → readBackupFile() → importAllSettings()
   → user_scripts 등 전체 복원
   → markSetupCompleted()
   → 일반 앱 UI로 전환
```

---

## 6. 변경 파일 목록

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `src/stores/theme.svelte.ts` | 수정 | localStorage → sync 마이그레이션, API 분리 |
| `src/stores/preferences.svelte.ts` | 수정 | localStorage → sync 마이그레이션 |
| `src/stores/setup_state.svelte.ts` | 신규 | 첫 설치 감지 스토어 |
| `src/popup.ts` | 수정 | initializeTheme → initializeThemeSync |
| `src/editor.ts` | 수정 | initializeTheme → initializeThemeSync |
| `src/services/backup_service.ts` | 수정 | setTheme await 추가 |
| `src/components/App/App.svelte` | 수정 | 첫 설치 UI + onMount async 변경 |
| `src/stores/__tests__/theme.svelte.test.ts` | 수정 | sync 테스트 추가 |
| `src/stores/__tests__/preferences.svelte.test.ts` | 수정 | sync 테스트 추가 |
| `src/stores/__tests__/setup_state.svelte.test.ts` | 신규 | 첫 설치 감지 테스트 |
| `src/services/__tests__/backup_service.test.ts` | 수정 | async 초기화 반영 |
| `src/components/App/__tests__/App.svelte.test.ts` | 수정 | 첫 설치 UI 테스트 추가 |
