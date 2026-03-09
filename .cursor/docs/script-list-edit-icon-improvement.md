# ScriptList 수정 버튼 아이콘 개선 설계 문서

## 요구사항 분석

### 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-1 | 수정 버튼의 `✏` 이모지를 세로 연필 모양 SVG 아이콘으로 교체 | 필수 |
| FR-2 | SVG는 `fill="currentColor"`로 Button 색상 토큰 상속 | 필수 |
| FR-3 | aria-label "스크립트 수정" 유지 | 필수 |
| FR-4 | 실행(▶), 삭제(🗑) 버튼 아이콘 개선 필요 여부 검토 | 선택 |

### 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-1 | Svelte 5 Runes 문법 준수 |
| NFR-2 | 프로젝트 디자인 토큰(--color-*, --space-*)과 일관성 |
| NFR-3 | 접근성 유지 (aria-label, 시각적 대비) |
| NFR-4 | 기존 Button variant="ghost" size="sm" 스타일 유지 |

---

## 현재 상태 분석

### ScriptList.svelte (82-86줄)

```svelte
<Button variant="ghost" size="sm" aria-label="스크립트 실행" ...>▶</Button>
<Button variant="ghost" size="sm" aria-label="스크립트 수정" ...>✏</Button>
<Button variant="ghost" size="sm" aria-label="스크립트 삭제" ...>🗑</Button>
```

- 모든 액션 버튼이 이모지 사용
- 수정 버튼 `✏`는 플랫폼별 렌더링 차이, 폰트 의존으로 시각적 불일치 가능

### 프로젝트 내 아이콘 패턴

| 위치 | 방식 | 크기 |
|------|------|------|
| SectionSettings.svelte | 인라인 SVG, fill="currentColor" | 16×16 |
| Toggle.svelte | 인라인 SVG, stroke="currentColor" | 14×14 |

- **권장 패턴**: 인라인 SVG, `fill="currentColor"` (ghost 버튼과 잘 맞음)
- **크기**: 14~16px (Button size="sm"에 적합)
- **공유 아이콘 컴포넌트 없음**: 인라인 SVG 사용이 프로젝트 관례

---

## 설계

### 1. 세로 연필 SVG 아이콘 스펙

**규격**
- viewBox: `0 0 16 16`
- size: `width="14" height="14"` (Button size="sm"과 조화)
- fill: `currentColor`
- role: `img` (선택, 버튼 내 아이콘만 있을 때)
- aria-hidden: `true` (버튼의 aria-label이 의미 전달)

**옵션 A: fill 기반 (SectionSettings와 동일 패턴)**

Heroicons solid pencil, `fill="currentColor"`:

```svg
<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
</svg>
```

**옵션 B: stroke 기반 (Toggle.svelte 패턴, Lucide Pencil)**

```svg
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
</svg>
```

- **권장**: 옵션 A (fill). SectionSettings와 동일한 `fill="currentColor"`로 프로젝트 일관성 유지.
- 두 옵션 모두 연필(edit) 아이콘으로 널리 인지됨. 사용자 "세로 연필" 요구는 대각선 연필 형태로 충족(연필 본체가 세로축 방향).

### 2. ScriptList.svelte 수정안

**변경 전**
```svelte
<Button variant="ghost" size="sm" aria-label="스크립트 수정" onclick={() => onedit(script)}>✏</Button>
```

**변경 후**
```svelte
<Button variant="ghost" size="sm" aria-label="스크립트 수정" onclick={() => onedit(script)}>
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="[세로 연필 path]" />
    </svg>
</Button>
```

### 3. 실행/삭제 버튼 검토 결과

| 버튼 | 현재 | 개선 필요 | 근거 |
|------|------|----------|------|
| 실행 | ▶ / ✓ / ✗ | 선택 | ▶는 재생 기호로 직관적. ✓/✗는 상태 피드백으로 적절. 이모지라도 의미 전달은 명확. |
| 삭제 | 🗑 | 권장 | 휴지통 이모지는 플랫폼별 차이 큼. SVG 휴지통 아이콘으로 통일 시 일관성 향상. |

**결론**
- **수정**: 필수 (사용자 요청)
- **삭제**: 동일 작업 범위 내 SVG 적용 권장
- **실행**: 유지 (상태별 ✓/✗ 표시가 현재 구조와 잘 맞음. 추후 통일 시 검토)

---

## 구현 가이드

### 개발자 체크리스트

1. [ ] `packages/ecount-dev-tool/src/components/UserScriptSection/ScriptList.svelte` 수정
2. [ ] 세로 연필 SVG path 결정 (위 예시 또는 동등한 수직형 연필)
3. [ ] `aria-hidden="true"` 유지 (버튼 aria-label로 대체)
4. [ ] 삭제 버튼 SVG 적용 시: 휴지통 아이콘 path 사용 (예: Heroicons trash)
5. [ ] `pnpm type-check`, `ReadLints` 실행하여 품질 게이트 통과

### 참고: 휴지통 SVG (삭제 버튼 적용 시)

```svg
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  <line x1="10" y1="11" x2="10" y2="17" />
  <line x1="14" y1="11" x2="14" y2="17" />
</svg>
```

---

## TODO 목록

| ID | 실행 순서 | 내용 | 담당 | 선행 |
|----|----------|------|------|------|
| impl-edit | [직렬-1] | ScriptList.svelte 수정 버튼에 세로 연필 SVG 적용 | developer | - |
| impl-delete | [직렬-2] | (선택) ScriptList.svelte 삭제 버튼에 휴지통 SVG 적용 | developer | impl-edit |
| qa | [직렬-3] | 시각적·접근성 검증 (Storybook/수동 확인) | qa | impl-edit |

---

## 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| 인라인 SVG 사용 | SectionSettings 등 기존 패턴과 일치, 공유 아이콘 컴포넌트 없음 | uikit Icon 컴포넌트 신규 추가 → 범위 확대 |
| 크기 14×14 | Button size="sm"과 조화, Toggle 아이콘과 유사 | 16×16 → SectionSettings와 동일하나 버튼에 다소 큼 |
| fill="currentColor" | ghost 버튼 색상 자동 상속 | stroke 기반 → Toggle은 stroke이나 fill이 단순한 아이콘에 적합 |
| 삭제 버튼 SVG 권장 | 연필 아이콘과 시각적 일관성 | 이번 작업에서 수정만 적용 → 범위 최소화 가능 |
| aria-hidden="true" | 버튼 aria-label이 역할 전달, 중복 방지 | role="img" + aria-label → 장식용 아이콘은 aria-hidden이 적절 |

---

## 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
|------|----------|--------|
| "세로 연필" path 표준 부재 | 구현 시 Lucide/Heroicons pencil 또는 유사 path 참고, 시각적으로 수직형 연필 형태 확인 | minor |
| 실행 버튼 ✓/✗ 동적 표시 | 현재 구조 유지, SVG로 교체 시 상태별 path 3종 필요 | none |
