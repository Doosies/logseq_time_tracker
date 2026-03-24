---
name: ecount-dev-tool
description: ecount-dev-tool Chrome Extension 패키지의 구현 지식. 스토어 초기화 순서, FOUC 방지 구현, 테스트 패턴 등.
---

# ecount-dev-tool 프로젝트 지식

## 스토어 초기화 순서 (이 패키지 전용)

onMount에서 의존 순서대로 await:

```typescript
onMount(async () => {
    await initializeSetupState(); // 1. 첫 설치 여부 판별
    await initializeTheme();      // 2. 테마 적용
    await initializePreferences(); // 3. 사용자 설정
});
```

- 스토어가 async로 바뀌면 **onMount에도 await 추가** (누락 시 준비 전에 UI 렌더링)
- 명세에 "마이그레이션 시 갱신할 상태 목록"이 없으면 구현 전 플래너/메인 에이전트에 확인

## FOUC 방지 구현

> **MV3 일반 패턴**: FOUC 방지를 위해 동기·비동기 이중 초기화를 쓰는 방식은 MV3 확장에서 흔하며, `.cursor/skills/stack/chrome-extension/`(예: `conventions.md`, `chrome-extension-storage.md` 레퍼런스)에도 관련 규칙이 있음. 아래 `initializeThemeSync` / `initializeTheme()` 등은 **이 패키지 전용** 함수명임.

각 스토어는 동기(Sync) + 비동기(Async) 함수 쌍을 가짐:

- `initializeThemeSync()`: localStorage에서 즉시 적용 (마운트 전 호출)
- `initializeTheme()`: chrome.storage.sync에서 확정 + 마이그레이션 (onMount에서 호출)

## 저장소 구성 (MV3 일반 패턴)

> `chrome.storage.*`·`localStorage` 역할 구분은 MV3 확장 일반 패턴이며, `.cursor/skills/stack/chrome-extension/`에도 관련 규칙이 있음.

| 저장소 | 용도 | 한계 |
|--------|------|------|
| `chrome.storage.sync` | 크로스 디바이스 자동 동기화 (소규모 설정) | 항목당 8KB, 총 100KB |
| `chrome.storage.local` | 기기별 로컬 데이터 (대용량, 플래그 등) | 5MB (무제한 요청 가능) |
| `localStorage` | FOUC 방지용 동기 캐시 | 크로스 디바이스 동기화 불가 |

## 마이그레이션 구현 예시 (이 패키지 전용 예시)

> **삼중 일치**(persist·메모리·파생 UI 동시 갱신) 개념은 `.cursor/skills/stack/chrome-extension/`과 정렬됨. 아래 코드·표·키(`theme` 등)는 **이 패키지 전용** 구현 세부사항임.

스토리지 마이그레이션 시 **삼중 일치** 구현:

```typescript
// persist + 메모리 스토어 + 파생 UI 상태를 동시에 처리
if (!synced && local) {
    current_theme = local;                            // 메모리 스토어
    await chrome.storage.sync.set({ theme: local }); // persist
    applyTheme();                                     // 파생 UI 상태
}
```

마이그레이션 상태 표:

| 상태 | 기존 저장소 | 새 저장소 | 마이그레이션 시 갱신 |
|------|-------------|-----------|---------------------|
| theme | localStorage | sync | current_theme, applyTheme() |

## 첫 설치 vs 기존 사용자 (이 패키지 전용)

- **첫 설치**: `setup_completed === undefined` → 셋업 위저드 표시
- **기존 사용자**: localStorage에 값이 있고 sync에 없음 → 마이그레이션 실행

## 테스트 시 상태 격리 (이 패키지 전용)

각 스토어는 `resetXForTests()` 함수를 제공:

```typescript
// 스토어 파일 (테스트 전용 export)
export function resetThemeForTests(): void {
    current_theme = 'auto';
    media_query = null;
}

// 테스트 파일
beforeEach(() => {
    resetThemeForTests();
});
```

### 첫 설치 상태 재현

```typescript
beforeEach(() => {
    local_storage_data['setup_completed'] = undefined;
    resetSetupState();
});
```

### 마이그레이션 검증

> **MV3 일반 패턴**: 테스트에서 `chrome.storage.sync.set` 등을 스파이/목으로 검증하는 방식은 MV3 확장 테스트에서 흔하며, `.cursor/skills/stack/chrome-extension/testing.md` 및 `.cursor/skills/qa/references/chrome-extension-testing.md`와 정렬됨. 아래 `initializeTheme`·`getTheme()` 등은 **이 패키지 전용**임.

```typescript
it('마이그레이션 후 메모리 스토어가 새 저장소 값과 일치한다', async () => {
    localStorage.setItem('theme', 'dark');
    await initializeTheme();

    expect(getTheme()).toBe('dark');
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ theme: 'dark' });
});
```
