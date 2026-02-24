<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, within } from '@storybook/test';
    import QuickLoginSection from './QuickLoginSection.svelte';

    const { Story } = defineMeta({
        component: QuickLoginSection,
        title: 'ecount-dev-tool/QuickLoginSection',
    });
</script>

<Story
    name="WithAccounts"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.queryAllByRole('button');
        await expect(buttons.length).toBeGreaterThan(0);
    }}
/>

<Story name="EmptyAccounts" />
