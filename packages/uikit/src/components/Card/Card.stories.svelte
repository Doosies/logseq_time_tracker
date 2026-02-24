<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, within } from '@storybook/test';
    import Card from './Card.svelte';
    import Button from '../Button/Button.svelte';

    const { Story } = defineMeta({
        component: Card,
        title: 'uikit/Card',
    });
</script>

<Story
    name="Default"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('카드 기본 내용')).toBeInTheDocument();
    }}
>
    <p>카드 기본 내용</p>
</Story>

<Story
    name="WithComponents"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('카드 제목')).toBeInTheDocument();
        await expect(canvas.getByRole('button')).toBeInTheDocument();
    }}
>
    <h3>카드 제목</h3>
    <p>카드 본문 텍스트입니다.</p>
    <Button variant="primary">버튼</Button>
</Story>
