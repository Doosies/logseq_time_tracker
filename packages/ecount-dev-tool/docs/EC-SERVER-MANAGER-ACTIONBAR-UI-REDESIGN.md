# EC Server Manager & ActionBar UI/UX 개편 설계 문서

**작성일**: 2026-02-25  
**작성자**: 기획 에이전트 (Planner)  
**버전**: 1.0

---

## 1. 요구사항 분석

### 1.1 기능 요구사항

| ID | 요구사항 | 비고 |
|----|----------|------|
| FR-1 | EC Server Manager 영역의 시각적 밀도 향상 | "휑함" 해소 |
| FR-2 | ActionBar 영역의 시각적 밀도 향상 | "휑함" 해소 |
| FR-3 | 전체 시각적 일관성 유지 | QuickLoginSection과 조화 |
| FR-4 | 개발자 도구답게 깔끔하고 효율적인 UI | 업무용 도구 특성 |

### 1.2 비기능 요구사항

| ID | 요구사항 | 비고 |
|----|----------|------|
| NFR-1 | 기존 Section, Button, Select 등 컴포넌트 최대 활용 | 새 컴포넌트 최소화 |
| NFR-2 | vanilla-extract + Svelte scoped style 사용 | 기술 스택 준수 |
| NFR-3 | 기능 변경 없음 | UI/레이아웃만 개선 |

### 1.3 제약사항

- 팝업 너비: 380px (콘텐츠 영역 ~348px)
- 대상 사용자: 개발자 (업무용 도구)
- 사용 가능 테마 변수: `--color-*`, `--space-*`, `--font-size-*`, `--radius-*`

---

## 2. 현재 UI 구조 분석

### 2.1 EC Server Manager (현재)

```
┌─────────────────────────────────────────┐
│ EC Server Manager                       │
├─────────────────────────────────────────┤
│ V5 Server:  [zeus08] [lxba1 ▼] [✏️]    │  ← server-row (margin-bottom: 4px)
│ V3 Server:  [zeus08] [ba1   ▼] [✏️]    │
│ [              Click                    ]│  ← fullWidth Button
└─────────────────────────────────────────┘
```

**문제점:**
- server-row 간격이 좁음 (4px) → 시각적 그룹핑 부족
- label과 ToggleInput이 단순 나열 → 계층 구조 약함
- 전체 영역에 배경/테두리 없음 → "휑함"
- "Click" 버튼이 기능을 직관적으로 전달하지 못함

### 2.2 ActionBar (현재)

```
┌─────────────────────────────────────────┐
│ [5.0로컬] [3.0로컬] [disableMin]        │  ← flex, gap: 4px, margin-top: 8px
└─────────────────────────────────────────┘
```

**문제점:**
- 버튼만 나열 → 그룹으로 인식되기 어려움
- margin-top만 있고 상하 패딩 없음 → 공간 활용 부족
- secondary variant만 사용 → 시각적 구분 없음
- 버튼 라벨이 축약형 → 의미 파악에 약간의 학습 필요

---

## 3. 개편 설계

### 3.1 EC Server Manager 개편

#### 3.1.1 변경 전/후 비교

**변경 전:**
```html
<Section title="EC Server Manager">
    <div class="server-row">...</div>
    <div class="server-row">...</div>
    <Button fullWidth onclick={...}>Click</Button>
</Section>
```

**변경 후 (HTML 구조):**
```html
<Section title="EC Server Manager">
    <div class="server-panel">
        <div class="server-row">
            <span class="server-label">V5</span>
            <ToggleInput ... />
        </div>
        <div class="server-row">
            <span class="server-label">V3</span>
            <ToggleInput ... />
        </div>
    </div>
    <Button fullWidth variant="primary" onclick={...}>서버 적용</Button>
</Section>
```

#### 3.1.2 적용할 CSS

```css
/* ServerManager.svelte - 추가/수정 스타일 */

.server-panel {
    /* 시각적 밀도: surface 배경 + 테두리로 그룹핑 */
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-md);
}

.server-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);  /* 4px → 8px: 행 간격 증가 */
}

.server-row:last-of-type {
    margin-bottom: 0;  /* 마지막 행 하단 여백 제거 */
}

.server-label {
    /* 라벨 시각적 강화: 배지 스타일 */
    min-width: 28px;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    background-color: var(--color-border);
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    text-align: center;
    flex-shrink: 0;
}
```

#### 3.1.3 시각적 효과 설명

| 요소 | 변경 | 효과 |
|------|------|------|
| server-panel | surface 배경 + border + padding | 서버 설정 영역이 하나의 카드처럼 그룹화됨 |
| server-row margin | 4px → 8px | 행 간 시각적 호흡 확보 |
| server-label | "V5 Server:" → "V5" 배지 | 공간 절약 + 버전 식별 강화 |
| Button 텍스트 | "Click" → "서버 적용" | 기능 명확화 |
| Button variant | (기본 primary) | CTA 강조 |

---

### 3.2 ActionBar 개편

#### 3.2.1 변경 전/후 비교

**변경 전:**
```html
<div class="action-bar">
    <Button variant="secondary" ...>5.0로컬</Button>
    <Button variant="secondary" ...>3.0로컬</Button>
    <Button variant="secondary" ...>disableMin</Button>
</div>
```

**변경 후 (HTML 구조):**
```html
<div class="action-bar">
    <div class="action-bar-inner">
        <Button variant="secondary" size="sm" ...>5.0로컬</Button>
        <Button variant="secondary" size="sm" ...>3.0로컬</Button>
        <Button variant="secondary" size="sm" ...>disableMin</Button>
    </div>
</div>
```

#### 3.2.2 적용할 CSS

```css
/* ActionBar.svelte - 수정 스타일 */

.action-bar {
    /* 상하 패딩 추가 → 시각적 밀도 */
    padding: var(--space-md) 0;
    margin-top: 0;  /* App.svelte의 hr.divider가 구분하므로 margin-top 제거 가능 */
}

.action-bar-inner {
    display: flex;
    gap: var(--space-sm);
    /* 그룹핑: surface 배경 + 테두리 */
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-sm);
}

.action-bar-inner :global(button) {
    flex: 1;
    white-space: nowrap;
    /* size="sm" 사용 시 padding이 작아지므로, 필요 시 min-height 보정 */
    min-height: 28px;
}
```

#### 3.2.3 시각적 효과 설명

| 요소 | 변경 | 효과 |
|------|------|------|
| action-bar | padding: 8px 0 | 상하 여백으로 영역 구분 |
| action-bar-inner | surface + border + padding | 버튼들이 하나의 툴바로 그룹화 |
| Button size | sm | 버튼 높이 감소 → 밀도 향상 |
| gap | 4px 유지 | 컴팩트한 배치 |

---

### 3.3 App.svelte 레이아웃 조정 (선택)

현재 `hr.divider`가 ServerManager와 ActionBar 사이에 있음. 개편 후에도 유지하되, ActionBar의 `margin-top`을 0으로 두고 `padding`으로 대체하면 일관성 유지.

```css
/* App.svelte - 변경 없음 (기존 유지) */
.divider {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: var(--space-md) 0;
}
```

---

## 4. 전체 레이아웃 개편 후 시각화

```
┌─────────────────────────────────────────┐
│ Quick Login Setting            [편집]   │
│ [btn] [btn] [btn] [btn] [btn]           │
│ [btn] [btn] [btn] [btn] [btn]           │
├─────────────────────────────────────────┤
│ EC Server Manager                       │
│ ┌─────────────────────────────────────┐ │
│ │ [V5] [zeus08] [lxba1 ▼] [✏️]       │ │  ← server-panel (surface 배경)
│ │ [V3] [zeus08] [ba1   ▼] [✏️]       │ │
│ └─────────────────────────────────────┘ │
│ [            서버 적용                  ]│
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [5.0로컬] [3.0로컬] [disableMin]   │ │  ← action-bar-inner (surface 배경)
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 5. 구현 가이드

### 5.1 ServerManager.svelte 수정 사항

1. **label → span.server-label**: `<label><b>V5 Server:</b></label>` → `<span class="server-label">V5</span>`
2. **server-panel 래퍼 추가**: 두 server-row를 `<div class="server-panel">`로 감싸기
3. **Button 텍스트 변경**: `Click` → `서버 적용`
4. **스타일 추가**: `.server-panel`, `.server-label` 스타일, `.server-row` 수정

### 5.2 ActionBar.svelte 수정 사항

1. **action-bar-inner 래퍼 추가**: 세 Button을 `<div class="action-bar-inner">`로 감싸기
2. **Button size="sm"** 추가
3. **스타일 수정**: `.action-bar` padding, `.action-bar-inner` 스타일 추가

### 5.3 주의사항

- **접근성**: `label` 제거 시 `aria-label` 또는 `title`로 대체 검토 (ToggleInput에 이미 prefix로 서버 정보 표시됨)
- **반응형**: 380px 고정이므로 미디어 쿼리 불필요
- **다크 모드**: `--color-surface`, `--color-border` 등 테마 변수 사용으로 자동 대응

---

## 6. 품질 체크

- [x] 모든 요구사항 커버 (FR-1~4, NFR-1~3)
- [x] 기존 컴포넌트만 활용 (Section, Button, ToggleInput)
- [x] 테마 변수 사용 (--color-*, --space-*, --radius-*)
- [x] 기능 변경 없음 (onclick, bind 등 로직 유지)
- [x] QuickLoginSection의 account-btn 그리드와 시각적 톤 일치 (surface, border 활용)

---

## 7. 예상 구현 시간

- ServerManager.svelte: 약 15분
- ActionBar.svelte: 약 10분
- **총 예상**: 25분 이내
