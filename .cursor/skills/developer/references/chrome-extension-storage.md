---
name: chrome-extension-storage
description: Chrome Extension 스토리지 마이그레이션 및 FOUC 방지 패턴. 저장소 교체/async 전환 시 삼중 일치 원칙과 2단계 초기화 패턴.
---

# Chrome Extension 스토리지 패턴

## 삼중 일치 원칙

저장소를 교체하거나 async로 전환할 때는 아래 3가지를 **동시에** 처리해야 합니다:

1. **persist**: 새 저장소에 값 저장
2. **메모리 스토어**: 현재 세션의 상태 변수 갱신
3. **파생 UI 상태**: 화면에 즉시 반영되는 파생 로직 실행

```typescript
// ❌ 저장소만 이관, 메모리 상태 미갱신
if (!synced && local) {
    await storage.set({ key: local }); // persist만
    // 메모리 상태 미갱신 → UI와 불일치
}

// ✅ 세 가지 모두 처리
if (!synced && local) {
    state_var = local;                 // 메모리 스토어
    await storage.set({ key: local }); // persist
    applyToUI();                       // 파생 UI 상태
}
```

## FOUC 방지 2단계 초기화

동기(localStorage)와 비동기(chrome.storage.sync/fetch) 저장소를 함께 쓸 때:

```typescript
// 1단계: 동기 함수 - 마운트 전 호출, localStorage에서 즉시 적용 (FOUC 방지)
export function initializeXSync(): void { /* localStorage 읽기 → 즉시 적용 */ }

// 2단계: async 함수 - onMount에서 호출, 원격/sync 저장소 확정 + 마이그레이션
export async function initializeX(): Promise<void> { /* 원격 저장소 확인 → 확정 */ }
```

### 왜 2단계인가

- 1단계(동기): 페이지 로드 직후 localStorage에서 즉시 읽어 UI 적용. 비동기 응답을 기다리지 않으므로 FOUC(Flash of Unstyled Content) 방지.
- 2단계(비동기): onMount 시점에 chrome.storage.sync 등 원격 저장소에서 최종 값을 확인하고, 필요 시 마이그레이션 수행.

## onMount에서 async 스토어 사용 시

- 스토어가 async로 바뀌면 **onMount에도 await 추가** (누락 시 준비 전에 UI 렌더링)
- 여러 스토어 초기화 시 **의존 순서**대로 await (예: 설정 → 테마 → 환경설정)

## 마이그레이션 분기 작성 시 체크리스트

마이그레이션 분기(기존 값 → 새 저장소 이관) 코드 작성 시:

- [ ] persist: 새 저장소에 값이 저장되는가?
- [ ] 메모리 스토어: 현재 세션 상태 변수가 갱신되는가?
- [ ] 파생 UI 상태: 화면에 즉시 반영되는가?
- [ ] 명세에 "마이그레이션 시 갱신할 상태 목록"이 있는가? 없으면 확인 요청.

## 프로젝트별 구체 구현

이 패턴의 프로젝트별 구체 구현(함수명, 초기화 순서 등)은 `project-knowledge` 스킬을 참조하세요.
