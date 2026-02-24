<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, within } from '@storybook/test';
    import ServerManagerStoryWrapper from './ServerManagerStoryWrapper.svelte';

    const { Story } = defineMeta({
        component: ServerManagerStoryWrapper,
        title: 'ecount-dev-tool/ServerManager',
    });
</script>

<Story
    name="ZeusEnvironment"
    args={{
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
    }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('V5 Server:')).toBeInTheDocument();
        await expect(canvas.getByText('V3 Server:')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'Click' })).toBeInTheDocument();
    }}
/>

<Story
    name="TestEnvironment"
    args={{
        url: 'https://onetestba1.ecount.com/ec5/view/erp?__v3domains=test',
    }}
/>

<Story
    name="UnsupportedEnvironment"
    args={{
        url: 'https://other.ecount.com/some/path',
    }}
/>
