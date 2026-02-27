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

DnD를 지원하는 체크박스 리스트입니다.

| Sub-component       | 설명                       |
| ------------------- | -------------------------- |
| `CheckboxList.Root` | 리스트 루트 (DnD 컨테이너) |
| `CheckboxList.Item` | 체크박스 아이템            |

```svelte
<CheckboxList.Root bind:items={sections} onchange={handleChange}>
    {#each sections as section (section.id)}
        <CheckboxList.Item id={section.id} label={section.label} checked={section.visible} />
    {/each}
</CheckboxList.Root>
```

### Dnd

드래그앤드롭 컴포넌트입니다 (svelte-dnd-action 기반).

| Sub-component | 설명                           |
| ------------- | ------------------------------ |
| `Dnd.Zone`    | DnD 가능 영역                  |
| `Dnd.Row`     | 드래그 가능한 행               |
| `Dnd.Handle`  | 드래그 핸들 (bar/icon variant) |

```svelte
<script>
  import { Dnd } from '@personal/uikit';
  import type { DndEvent } from '@personal/uikit';
</script>

<Dnd.Zone items={list} onfinalize={(e: DndEvent) => list = e.detail.items}>
  {#each list as item (item.id)}
    <Dnd.Row id={item.id}>
      <Dnd.Handle variant="bar" />
      <span>{item.name}</span>
    </Dnd.Row>
  {/each}
</Dnd.Zone>
```
