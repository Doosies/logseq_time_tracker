<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import Section from './Section.svelte';

    const { Story } = defineMeta({
        component: Section,
        title: 'uikit/Section',
        argTypes: {
            title: { control: 'text' },
        },
    });
</script>

<Story name="WithTitle" args={{ title: '섹션 제목' }}>
    <p>섹션 내용입니다.</p>
</Story>

<Story name="WithoutTitle">
    <p>제목 없는 섹션 내용</p>
</Story>

<Story name="LongContent" args={{ title: '긴 내용' }}>
    <p>첫 번째 단락</p>
    <p>두 번째 단락</p>
    <p>세 번째 단락 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</Story>
