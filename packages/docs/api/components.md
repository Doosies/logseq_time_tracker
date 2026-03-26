# Components

## Simple 컴포넌트

### Button

```svelte
<script>
    import { Button } from '@personal/uikit';
</script>

<Button variant="primary" size="md" onclick={() => {}}>버튼</Button>
```

| Prop        | 타입                                   | 기본값      | 설명        |
| ----------- | -------------------------------------- | ----------- | ----------- |
| `variant`   | `'primary' \| 'secondary' \| 'accent'` | `'primary'` | 버튼 스타일 |
| `size`      | `'sm' \| 'md'`                         | `'md'`      | 버튼 크기   |
| `disabled`  | `boolean`                              | `false`     | 비활성화    |
| `fullWidth` | `boolean`                              | `false`     | 전체 너비   |
| `onclick`   | `() => void`                           | -           | 클릭 핸들러 |

### TextInput

```svelte
<script>
    import { TextInput } from '@personal/uikit';
    let username = $state('');
</script>

<TextInput bind:value={username} placeholder="입력하세요" />
```

| Prop          | 타입                      | 기본값  | 설명               |
| ------------- | ------------------------- | ------- | ------------------ |
| `value`       | `string`                  | `''`    | 입력값 (bind 가능) |
| `placeholder` | `string`                  | -       | 플레이스홀더       |
| `disabled`    | `boolean`                 | `false` | 비활성화           |
| `oninput`     | `(value: string) => void` | -       | 입력 핸들러        |

### Textarea

여러 줄 텍스트 입력입니다. `monospace` 옵션으로 코드·로그 스타일에 맞출 수 있습니다.

```svelte
<script>
    import { Textarea } from '@personal/uikit';
    let note = $state('');
</script>

<Textarea bind:value={note} placeholder="메모" rows={5} />
```

| Prop          | 타입                      | 기본값  | 설명                  |
| ------------- | ------------------------- | ------- | --------------------- |
| `value`       | `string`                  | -       | 입력값 (`bind:value`) |
| `placeholder` | `string`                  | `''`    | 플레이스홀더          |
| `disabled`    | `boolean`                 | `false` | 비활성화              |
| `rows`        | `number`                  | `3`     | 표시 줄 수            |
| `monospace`   | `boolean`                 | `false` | 고정폭 글꼴 스타일    |
| `oninput`     | `(value: string) => void` | -       | 입력 핸들러           |

### LayoutSwitcher

컨테이너 너비를 `ResizeObserver`로 관측해 `layout_mode`를 `compact` / `full`로 나눕니다. 반응형 레이아웃 분기에 사용합니다.

```svelte
<script>
    import { LayoutSwitcher } from '@personal/uikit';
</script>

<LayoutSwitcher breakpoint={600}>
    {#snippet children({ layout_mode })}
        {#if layout_mode === 'full'}
            <p>넓은 레이아웃</p>
        {:else}
            <p>좁은 레이아웃</p>
        {/if}
    {/snippet}
</LayoutSwitcher>
```

| Prop         | 타입     | 기본값 | 설명                             |
| ------------ | -------- | ------ | -------------------------------- |
| `breakpoint` | `number` | `600`  | 이 너비(px) 이상이면 `full`      |
| `class`      | `string` | -      | 루트 요소 클래스                 |
| `children`   | Snippet  | (필수) | `{ layout_mode }` 인자로 UI 분기 |

### DatePicker

달력 패널에서 단일 날짜를 선택합니다. `min` / `max`로 선택 가능 구간을 제한할 수 있습니다.

```svelte
<script>
    import { DatePicker } from '@personal/uikit';
    let date = $state<string | null>(null);
</script>

<DatePicker value={date} onSelect={(d) => (date = d)} locale="ko-KR" />
```

| Prop       | 타입                     | 기본값    | 설명                |
| ---------- | ------------------------ | --------- | ------------------- |
| `value`    | `string \| null`         | (필수)    | 선택된 날짜(문자열) |
| `onSelect` | `(date: string) => void` | (필수)    | 날짜 선택 시 호출   |
| `min`      | `string`                 | -         | 선택 가능 최소일    |
| `max`      | `string`                 | -         | 선택 가능 최대일    |
| `locale`   | `string`                 | `'ko-KR'` | 달력 로케일         |
| `class`    | `string`                 | -         | 루트 클래스         |

### TimeRangePicker

시작·종료 시각(및 날짜) 범위를 고릅니다. 내부적으로 DatePicker 스타일과 범위 전용 레이아웃을 사용합니다.

| Prop            | 타입                                   | 설명               |
| --------------- | -------------------------------------- | ------------------ |
| `started_at`    | `string`                               | 시작 시각          |
| `ended_at`      | `string`                               | 종료 시각          |
| `onChange`      | `(start: string, end: string) => void` | 범위 변경 시       |
| `start_label`   | `string`                               | 시작 필드 라벨     |
| `end_label`     | `string`                               | 종료 필드 라벨     |
| `error_message` | `string`                               | 유효성 오류 메시지 |
| `class`         | `string`                               | 루트 클래스        |

### PromptDialog

모달로 짧은 텍스트(사유·메모 등)를 입력받습니다. 확인 시 `onconfirm`에 입력 문자열을 넘깁니다.

| Prop            | 타입                                        | 기본값         | 설명                |
| --------------- | ------------------------------------------- | -------------- | ------------------- |
| `title`         | `string`                                    | (필수)         | 제목                |
| `description`   | `string`                                    | `''`           | 본문 설명           |
| `placeholder`   | `string`                                    | `''`           | 입력창 힌트         |
| `max_length`    | `number`                                    | `500`          | 최대 글자 수        |
| `allow_empty`   | `boolean`                                   | `false`        | 빈 문자 허용        |
| `confirm_label` | `string`                                    | `'확인'`       | 확인 버튼           |
| `cancel_label`  | `string`                                    | `'취소'`       | 취소 버튼           |
| `loading_label` | `string`                                    | `'처리 중...'` | 비동기 처리 중 라벨 |
| `onconfirm`     | `(reason: string) => void \| Promise<void>` | (필수)         | 확인                |
| `oncancel`      | `() => void`                                | (필수)         | 취소                |

### ElapsedTimer

누적 경과 시간(ms)과 현재 구간 시작 시각을 바탕으로 타이머를 표시합니다. 선택적 `formatter`로 표시 문자열을 바꿀 수 있습니다.

| Prop             | 타입                                | 기본값        | 설명                |
| ---------------- | ----------------------------------- | ------------- | ------------------- |
| `accumulated_ms` | `number`                            | (필수)        | 누적 밀리초         |
| `segment_start`  | `string \| null`                    | (필수)        | 현재 구간 시작 시각 |
| `is_paused`      | `boolean`                           | (필수)        | 일시정지 여부       |
| `formatter`      | `(total_seconds: number) => string` | -             | 커스텀 포맷         |
| `label`          | `string`                            | `'경과 시간'` | 접근성·표시 라벨    |
| `class`          | `string`                            | -             | 루트 클래스         |

### Select

```svelte
<script>
    import { Select } from '@personal/uikit';
    import type { SelectOption } from '@personal/uikit';

    let selected = $state('opt1');
    const options: SelectOption[] = [
        { value: 'opt1', label: '옵션 1' },
        { value: 'opt2', label: '옵션 2' },
    ];
</script>

<Select bind:value={selected} {options} />
```

### ButtonGroup

버튼들을 그룹으로 묶는 레이아웃 컴포넌트입니다.

```svelte
<ButtonGroup>
    <Button variant="primary">확인</Button>
    <Button variant="secondary">취소</Button>
</ButtonGroup>
```

---

## Compound 컴포넌트

### Card

카드 컨테이너입니다.

| Sub-component | 설명               |
| ------------- | ------------------ |
| `Card.Root`   | 카드 루트 컨테이너 |
| `Card.Header` | 카드 헤더          |
| `Card.Body`   | 카드 본문          |
| `Card.Footer` | 카드 푸터          |

```svelte
<Card.Root>
    <Card.Header>제목</Card.Header>
    <Card.Body>내용</Card.Body>
    <Card.Footer>푸터</Card.Footer>
</Card.Root>
```

### Section

접기/펼치기를 지원하는 섹션 레이아웃입니다.

| Sub-component     | 설명                             |
| ----------------- | -------------------------------- |
| `Section.Root`    | 섹션 루트                        |
| `Section.Header`  | 섹션 헤더 (클릭으로 접기/펼치기) |
| `Section.Title`   | 섹션 제목                        |
| `Section.Action`  | 헤더 우측 액션 영역              |
| `Section.Content` | 섹션 본문 (접힌 상태에서 숨김)   |

```svelte
<Section.Root>
    <Section.Header>
        <Section.Title>설정</Section.Title>
        <Section.Action>
            <Button size="sm">편집</Button>
        </Section.Action>
    </Section.Header>
    <Section.Content>
        <p>섹션 내용</p>
    </Section.Content>
</Section.Root>
```

### ToggleInput

토글 스위치 컴포넌트입니다.

| Sub-component        | 설명              |
| -------------------- | ----------------- |
| `ToggleInput.Root`   | 토글 루트         |
| `ToggleInput.Prefix` | 토글 앞 라벨/내용 |
| `ToggleInput.Toggle` | 토글 스위치       |

```svelte
<ToggleInput.Root>
    <ToggleInput.Prefix>다크 모드</ToggleInput.Prefix>
    <ToggleInput.Toggle bind:checked={is_dark} />
</ToggleInput.Root>
```

### Popover

클릭으로 열리는 팝오버입니다. 외부 클릭/Escape 키로 자동 닫힙니다.

| Sub-component     | 설명                      |
| ----------------- | ------------------------- |
| `Popover.Root`    | 팝오버 상태 관리          |
| `Popover.Trigger` | 팝오버를 여는 트리거 버튼 |
| `Popover.Content` | 팝오버 내용               |

```svelte
<Popover.Root>
    <Popover.Trigger>설정</Popover.Trigger>
    <Popover.Content>
        <p>팝오버 내용</p>
    </Popover.Content>
</Popover.Root>
```

### Toast

타이머 기반 토스트 알림입니다.

| Sub-component    | 설명                 |
| ---------------- | -------------------- |
| `Toast.Provider` | 토스트 컨텍스트 제공 |
| `Toast.Root`     | 토스트 메시지 렌더링 |

```svelte
<Toast.Provider>
    <!-- 자식 컴포넌트에서 getContext로 toast 함수 접근 -->
    <Toast.Root />
</Toast.Provider>
```

### CheckboxList

`@dnd-kit/svelte` 기반 DnD와 연동되는 체크박스 리스트입니다.

| Sub-component       | 설명                      |
| ------------------- | ------------------------- |
| `CheckboxList.Root` | 리스트 루트 (정렬·재배치) |
| `CheckboxList.Item` | 체크박스 아이템           |

```svelte
<CheckboxList.Root {items} onreorder={handleReorder}>
    {#snippet item({ item, index, handleAttach })}
        <CheckboxList.Item {handleAttach} checked={item.visible} ontoggle={() => toggle(item.id)}>
            {item.label}
        </CheckboxList.Item>
    {/snippet}
</CheckboxList.Root>
```

### Dnd

드래그앤드롭 정렬 컴포넌트입니다 (`@dnd-kit/svelte`, `@dnd-kit/dom`, `@dnd-kit/helpers` 기반).

| Sub-component  | 설명                                  |
| -------------- | ------------------------------------- |
| `Dnd.Provider` | 드래그 컨텍스트·센서·항목 배열 재정렬 |
| `Dnd.Sortable` | 단일 행; `handleAttach`로 핸들 연결   |

```svelte
<script>
    import * as Dnd from '@personal/uikit';

    let items = $state([
        { id: '1', label: 'Row 1' },
        { id: '2', label: 'Row 2' },
    ]);
</script>

<Dnd.Provider {items} onreorder={(next) => (items = next)}>
    {#each items as item, index (item.id)}
        <Dnd.Sortable id={item.id} {index}>
            {#snippet children({ handleAttach })}
                <span data-drag-handle {@attach handleAttach}>⠿</span>
                <span>{item.label}</span>
            {/snippet}
        </Dnd.Sortable>
    {/each}
</Dnd.Provider>
```
