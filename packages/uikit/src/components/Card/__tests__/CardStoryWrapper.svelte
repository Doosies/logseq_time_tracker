<script lang="ts">
    import * as Card from '../';
    import Button from '../../Button/Button.svelte';

    interface Props {
        scenario?: 'default' | 'withComponents' | 'headerFooterOnly' | 'allParts';
    }

    let { scenario = 'default' }: Props = $props();
</script>

<Card.Root>
    {#if scenario === 'default' || scenario === 'headerFooterOnly' || scenario === 'allParts'}
        <Card.Header>카드 헤더</Card.Header>
    {/if}
    {#if scenario === 'default' || scenario === 'withComponents' || scenario === 'allParts'}
        <Card.Body>
            {#if scenario === 'default' || scenario === 'allParts'}
                <p>카드 기본 내용</p>
            {:else if scenario === 'withComponents'}
                <h3>카드 제목</h3>
                <p>카드 본문 텍스트입니다.</p>
                <Button variant="primary">버튼</Button>
            {/if}
        </Card.Body>
    {/if}
    {#if scenario === 'headerFooterOnly' || scenario === 'allParts'}
        <Card.Footer>카드 푸터</Card.Footer>
    {/if}
</Card.Root>
