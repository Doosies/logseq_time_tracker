<script lang="ts">
    import * as Card from '../';
    import Button from '../../Button/Button.svelte';

    interface Props {
        scenario?: 'default' | 'withComponents';
    }

    let { scenario = 'default' }: Props = $props();
</script>

<Card.Root>
    <Card.Body>
        {#if scenario === 'default'}
            <p>카드 기본 내용</p>
        {:else if scenario === 'withComponents'}
            <h3>카드 제목</h3>
            <p>카드 본문 텍스트입니다.</p>
            <Button variant="primary">버튼</Button>
        {/if}
    </Card.Body>
</Card.Root>
