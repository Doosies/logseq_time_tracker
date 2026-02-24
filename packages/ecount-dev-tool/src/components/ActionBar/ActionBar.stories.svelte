<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, within } from '@storybook/test';
    import ActionBar from './ActionBar.svelte';

    const { Story } = defineMeta({
        component: ActionBar,
        title: 'ecount-dev-tool/ActionBar',
    });
</script>

<Story
    name="Default"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: '5.0 로컬' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '3.0 로컬' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'disableMin 활성화 (devMode)' })).toBeInTheDocument();
    }}
/>
