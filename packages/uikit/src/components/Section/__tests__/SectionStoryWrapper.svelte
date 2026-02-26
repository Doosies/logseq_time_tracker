<script lang="ts">
    import * as Section from '../';

    interface Props {
        title?: string;
        scenario?: 'withTitle' | 'withoutTitle' | 'longContent';
    }

    let { title, scenario = 'withTitle' }: Props = $props();
</script>

<Section.Root>
    {#if title}
        <Section.Header>
            <Section.Title>{title}</Section.Title>
        </Section.Header>
    {/if}

    <Section.Content>
        {#if scenario === 'withTitle'}
            <p>섹션 내용입니다.</p>
        {:else if scenario === 'withoutTitle'}
            <p>제목 없는 섹션 내용</p>
        {:else if scenario === 'longContent'}
            <p>첫 번째 단락</p>
            <p>두 번째 단락</p>
            <p>세 번째 단락 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        {/if}
    </Section.Content>
</Section.Root>
