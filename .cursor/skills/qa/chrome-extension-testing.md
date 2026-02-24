---
name: chrome-extension-testing
description: Chrome Extension API 모킹 - Vitest에서 chrome.tabs, chrome.scripting, window/top 글로벌 모킹 패턴
---

# Chrome Extension API 테스트 가이드

이 Skill은 QA 에이전트가 Chrome Extension(Manifest V3) API를 Vitest에서 모킹하여 테스트하는 패턴을 제공합니다.

## 글로벌 Chrome Mock 설정

### setup.ts (테스트 초기화 파일)

```typescript
// src/test/setup.ts
import { vi, beforeEach } from 'vitest';

const chrome_mock = {
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({}),
    onActivated: { addListener: vi.fn() },
    onUpdated: { addListener: vi.fn() },
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: undefined }]),
  },
};

vi.stubGlobal('chrome', chrome_mock);

beforeEach(() => {
  vi.clearAllMocks();
});
```

### vitest.config.ts에서 setupFiles 지정

```typescript
export default defineConfig({
  test: {
    setupFiles: ['src/test/setup.ts'],
  },
});
```

---

## chrome.tabs API 테스트

### getCurrentTab (tabs.query)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getCurrentTab } from '@/services/tab_service';

describe('getCurrentTab', () => {
  it('현재 활성 탭을 반환해야 함', async () => {
    // Arrange
    const mock_tab = {
      id: 1,
      url: 'https://zeus01ba1.ecount.com/ECERP/ECP050M',
    };
    vi.mocked(chrome.tabs.query).mockResolvedValue([mock_tab]);

    // Act
    const tab = await getCurrentTab();

    // Assert
    expect(chrome.tabs.query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
    expect(tab).toEqual(mock_tab);
  });

  it('탭이 없을 때 undefined를 반환해야 함', async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([]);

    const tab = await getCurrentTab();

    expect(tab).toBeUndefined();
  });
});
```

### updateTabUrl (tabs.update)

```typescript
describe('updateTabUrl', () => {
  it('탭 URL을 업데이트하고 window.close를 호출해야 함', async () => {
    // Arrange
    const close_mock = vi.fn();
    vi.stubGlobal('close', close_mock);

    // Act
    await updateTabUrl(1, 'https://new-url.ecount.com/');

    // Assert
    expect(chrome.tabs.update).toHaveBeenCalledWith(1, {
      url: 'https://new-url.ecount.com/',
    });
    expect(close_mock).toHaveBeenCalled();
  });
});
```

---

## chrome.scripting API 테스트

### executeScript

```typescript
describe('executeScript', () => {
  it('현재 탭에서 스크립트를 실행해야 함', async () => {
    const mock_func = vi.fn();

    await executeScript(1, mock_func);

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 1 },
      func: mock_func,
    });
  });
});
```

### executeMainWorldScript (MAIN world)

```typescript
describe('executeMainWorldScript', () => {
  it('MAIN world에서 스크립트를 실행해야 함', async () => {
    const mock_func = vi.fn();

    await executeMainWorldScript(1, mock_func);

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 1 },
      func: mock_func,
      world: 'MAIN',
    });
  });
});
```

---

## window/top 글로벌 모킹

Chrome Extension에서 `top` 객체를 통해 상위 프레임에 접근하는 경우가 있습니다.

### top.location 모킹

```typescript
describe('switchV5TestServer', () => {
  it('top.location.href를 변경해야 함', () => {
    // Arrange
    const mock_top = {
      location: { href: '' },
    };
    vi.stubGlobal('top', mock_top);

    // Act
    switchV5TestServer();

    // Assert
    expect(mock_top.location.href).toBe(
      'https://onetestba1.ecount.com/login/login.aspx'
    );
  });
});
```

### top.$ECount, top.$ECountApp 모킹

```typescript
describe('debugAndGetPageInfo', () => {
  it('$ECount.setDevMode가 있을 때 hasSetDevMode=true를 반환해야 함', () => {
    // Arrange
    const mock_top = {
      $ECount: { setDevMode: vi.fn() },
      $ECountApp: {
        getContext: () => ({
          config: { ec_zone_num: 'BA1' },
        }),
      },
      location: { href: 'https://zeus01ba1.ecount.com/' },
    };
    vi.stubGlobal('top', mock_top);

    // Act
    const info = debugAndGetPageInfo();

    // Assert
    expect(info.hasSetDevMode).toBe(true);
    expect(info.zoneNum).toBe('BA1');
  });

  it('$ECount가 없을 때 hasSetDevMode=false를 반환해야 함', () => {
    const mock_top = {
      location: { href: 'https://zeus01ba1.ecount.com/' },
    };
    vi.stubGlobal('top', mock_top);

    const info = debugAndGetPageInfo();

    expect(info.hasSetDevMode).toBe(false);
  });
});
```

---

## DOM 모킹 (page_actions)

Chrome Extension이 페이지 DOM을 조작하는 경우:

### document.querySelector 모킹

```typescript
describe('inputLogin', () => {
  it('로그인 필드에 값을 설정해야 함', () => {
    // Arrange
    const mock_input = { value: '' } as HTMLInputElement;
    vi.spyOn(document, 'querySelector').mockReturnValue(mock_input);

    // Act
    inputLogin('testuser', 'password123');

    // Assert
    expect(mock_input.value).toBe('testuser');
  });
});
```

### nativeInputValueSetter (React controlled input)

React/Svelte가 관리하는 input에 값을 설정하려면 nativeInputValueSetter를 사용하는 경우가 있습니다:

```typescript
it('nativeInputValueSetter로 값을 설정해야 함', () => {
  const mock_setter = vi.fn();
  const mock_prototype = {
    set: mock_setter,
  };
  vi.spyOn(
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype, 'value'
    )!,
    'set'
  ).mockImplementation(mock_setter);

  // ... 테스트 실행
});
```

---

## window.close 모킹

Chrome Extension popup에서 `window.close()`를 호출하는 경우:

```typescript
beforeEach(() => {
  vi.stubGlobal('close', vi.fn());
});

it('window.close를 호출해야 함', async () => {
  await updateTabUrl(1, 'https://new-url.com/');

  expect(window.close).toHaveBeenCalled();
});
```

---

## alert/confirm 모킹

```typescript
it('지원하지 않는 환경에서 alert를 표시해야 함', () => {
  const alert_mock = vi.fn();
  vi.stubGlobal('alert', alert_mock);

  // Act - 지원하지 않는 URL로 서버 변경 시도
  handleServerChange('unknown');

  // Assert
  expect(alert_mock).toHaveBeenCalledWith(
    expect.stringContaining('지원하지 않는')
  );
});
```

---

## Mock 초기화 패턴

### beforeEach에서 clearAllMocks

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

이렇게 하면 모든 mock의 호출 기록이 초기화되지만, mock 구현은 유지됩니다.

### 특정 mock만 재설정

```typescript
beforeEach(() => {
  vi.mocked(chrome.tabs.query).mockResolvedValue([]);
  vi.mocked(chrome.tabs.update).mockResolvedValue({});
});
```

### afterEach에서 글로벌 복원

```typescript
afterEach(() => {
  vi.unstubAllGlobals();
});
```

**주의**: `vi.unstubAllGlobals()`는 setup.ts에서 설정한 `chrome` mock도 제거합니다. 필요한 경우 선택적으로 복원하세요.

---

## 비동기 테스트 패턴

Chrome API는 대부분 Promise 기반입니다:

```typescript
it('비동기 작업을 올바르게 처리해야 함', async () => {
  vi.mocked(chrome.tabs.query).mockResolvedValue([{ id: 1 }]);

  const result = await getCurrentTab();

  expect(result).toBeDefined();
});

it('API 에러를 처리해야 함', async () => {
  vi.mocked(chrome.tabs.query).mockRejectedValue(
    new Error('Permission denied')
  );

  await expect(getCurrentTab()).rejects.toThrow('Permission denied');
});
```

---

## 체크리스트

테스트 작성 완료 후:

- [ ] setup.ts에 chrome mock이 올바르게 설정됨
- [ ] beforeEach에서 mock 초기화 (vi.clearAllMocks)
- [ ] chrome.tabs API 호출 검증 (인자 포함)
- [ ] chrome.scripting API 호출 검증 (world 옵션 포함)
- [ ] window/top 글로벌이 올바르게 모킹됨
- [ ] window.close 호출 검증
- [ ] alert/confirm 호출 검증 (해당 시)
- [ ] 비동기 에러 케이스 테스트
- [ ] Mock 간 격리 확인 (테스트 독립성)
- [ ] 테스트 설명 한글 작성
