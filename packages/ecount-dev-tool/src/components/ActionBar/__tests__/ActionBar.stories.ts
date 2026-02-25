import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import ActionBar from '../ActionBar.svelte';

const meta = {
    component: ActionBar,
    title: 'ecount-dev-tool/ActionBar',
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: '5.0로컬' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '3.0로컬' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'disableMin' })).toBeInTheDocument();
    },
};
