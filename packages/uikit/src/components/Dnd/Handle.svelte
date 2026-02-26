<!--
@component Dnd.Handle - 드래그 핸들

DragHandle 컴포넌트를 Dnd namespace로 re-export합니다.
`variant`로 bar(기본) 또는 icon 스타일을 선택할 수 있습니다.

@example
```svelte
<Dnd.Handle variant="icon" label="드래그하여 순서 변경" />
```
-->
<script lang="ts">
    import DragHandle from '../DragHandle/DragHandle.svelte';

    interface Props {
        variant?: 'bar' | 'icon';
        label?: string;
    }

    let { variant = 'bar', label = '드래그하여 순서 변경' }: Props = $props();
</script>

<DragHandle {variant} {label} />
