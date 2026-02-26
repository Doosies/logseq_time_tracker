<script lang="ts">
    import * as Section from '../';

    interface Props {
        title?: string;
        scenario?: 'withTitle' | 'withoutTitle' | 'longContent' | 'withAction';
    }

    let { title, scenario = 'withTitle' }: Props = $props();
</script>

<Section.Root>
    {#if scenario === 'withAction'}
        <Section.Header>
            <Section.Title>{title}</Section.Title>
            <Section.Action>
                <button type="button">편집</button>
            </Section.Action>
        </Section.Header>
    {:else if title}
        <Section.Header>
            <Section.Title>{title}</Section.Title>
        </Section.Header>
    {/if}

    <Section.Content>
        {#if scenario === 'withTitle' || scenario === 'withAction'}
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
