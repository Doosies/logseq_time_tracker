<script lang="ts">
    import type { TooltipPosition } from '../../../design/types';
    import { Tooltip } from '../index';
    import Button from '../../Button/Button.svelte';

    interface Props {
        content?: string;
        position?: TooltipPosition;
        disabled?: boolean;
        scenario?: 'default' | 'all-positions' | 'long-content' | 'disabled' | 'with-button';
    }

    let { content = '툴팁 내용', position = 'top', disabled = false, scenario = 'default' }: Props = $props();

    const long_content = '이것은 매우 긴 툴팁 텍스트입니다. maxWidth를 테스트하기 위해 여러 줄로 표시되어야 합니다.';
</script>

{#if scenario === 'all-positions'}
    <div style="display: flex; gap: 2rem; flex-wrap: wrap; padding: 4rem;">
        <Tooltip content="상단 툴팁" position="top">
            <button type="button">Top</button>
        </Tooltip>
        <Tooltip content="하단 툴팁" position="bottom">
            <button type="button">Bottom</button>
        </Tooltip>
        <Tooltip content="왼쪽 툴팁" position="left">
            <button type="button">Left</button>
        </Tooltip>
        <Tooltip content="오른쪽 툴팁" position="right">
            <button type="button">Right</button>
        </Tooltip>
    </div>
{:else if scenario === 'long-content'}
    <Tooltip content={long_content}>
        <button type="button">긴 내용 호버</button>
    </Tooltip>
{:else if scenario === 'disabled'}
    <Tooltip content="비활성화된 툴팁" position="top" disabled={true}>
        <button type="button">호버해도 표시 안 됨</button>
    </Tooltip>
{:else if scenario === 'with-button'}
    <Tooltip {content} {position}>
        <Button variant="primary" size="md">버튼에 툴팁</Button>
    </Tooltip>
{:else}
    <Tooltip {content} {position} {disabled}>
        <button type="button">호버 대상</button>
    </Tooltip>
{/if}
