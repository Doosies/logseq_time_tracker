# 섹션 숨기기/보이기 기능 설계 문서

**작성일**: 2026-02-25  
**버전**: 1.0

---

## 1. 개요

각 섹션(빠른 로그인, 서버 관리, 빠른 실행)을 완전히 숨기거나 다시 표시할 수 있는 기능.  
기존 접기/펼치기(collapse)와 달리, 숨기기(visibility)는 섹션 자체를 화면에서 제거한다.

### 접기 vs 숨기기 비교

| 기능 | 접기(Collapse) | 숨기기(Visibility) |
|------|---------------|-------------------|
| 타이틀 표시 | O (항상 보임) | X (완전히 제거) |
| 내용 표시 | X (접힌 상태) | X (전체 미표시) |
| 토글 위치 | 섹션 타이틀 클릭 | 설정 패널 (⚙) |
| 독립성 | 숨기기와 독립 | 접기와 독립 |

---

## 2. 아키텍처

### 2.1 데이터 흐름

```
chrome.storage.sync
    ↕ (읽기/쓰기)
section_visibility.svelte.ts (스토어)
    ↕ (상태 제공)
App.svelte
    ├─ SectionSettings (⚙ 설정 패널)
    ├─ {#if visible} QuickLoginSection {/if}
    ├─ {#if visible} ServerManager {/if}
    └─ {#if visible} ActionBar {/if}
```

### 2.2 Storage 키

- **키**: `section_visibility_state`
- **타입**: `Record<string, boolean>`
- **기본값**: `{}` (없는 키는 `true`로 간주 = 기본 보임)

### 2.3 안전장치

- **최소 1개 섹션 보장**: 마지막 보이는 섹션은 숨길 수 없음
- **롤백**: storage 저장 실패 시 이전 상태로 복원
- **유효성 검증**: 저장 데이터가 올바르지 않으면 기본 상태 사용

---

## 3. 변경 파일 목록

### 신규 파일

| 파일 | 역할 |
|------|------|
| `stores/section_visibility.svelte.ts` | 가시성 상태 관리 스토어 |
| `components/SectionSettings/SectionSettings.svelte` | 설정 UI 컴포넌트 |
| `components/SectionSettings/index.ts` | 배럴 export |
| `stores/__tests__/section_visibility.svelte.test.ts` | 스토어 단위 테스트 (11개) |

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `stores/index.ts` | `section_visibility.svelte` export 추가 |
| `components/App/App.svelte` | SectionSettings 배치, 조건부 렌더링 |
| `components/App/__tests__/App.svelte.test.ts` | 숨기기/보이기 통합 테스트 (6개) |

---

## 4. API 명세

### section_visibility.svelte.ts

```typescript
initializeVisibility(): Promise<void>
// chrome.storage.sync에서 상태 복원

isSectionVisible(section_id: string): boolean
// 섹션 가시성 반환 (기본: true)

toggleVisibility(
    section_id: string,
    visible_ids: string[]
): Promise<boolean>
// 가시성 토글. 마지막 섹션이면 false 반환
```

### SectionSettings.svelte Props

```typescript
interface SectionItem {
    id: string;
    label: string;
}

interface SectionSettingsProps {
    sections: SectionItem[];
}
```

---

## 5. 테스트 현황

- 스토어 단위 테스트: **11개** (초기화 4 + 토글 6 + 기본값 1)
- 통합 테스트: **6개** (설정 버튼 렌더링, 패널 열기, 숨기기, 저장, 복원, 최소 보장)
- 전체 테스트: **153개 통과** (기존 136 + 신규 17)
