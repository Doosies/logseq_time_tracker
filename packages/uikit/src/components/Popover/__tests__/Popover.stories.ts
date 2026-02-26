import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import PopoverStoryWrapper from './PopoverStoryWrapper.svelte';

const meta = {
    component: PopoverStoryWrapper,
    title: 'uikit/Popover',
} satisfies Meta<typeof PopoverStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button');
        await expect(trigger).toBeInTheDocument();
        await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    },
};

export const Opened: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button');
        await userEvent.click(trigger);
        await expect(canvas.getByRole('dialog')).toBeInTheDocument();
        await expect(canvas.getByText('팝오버 내용')).toBeInTheDocument();
    },
};

export const CloseOnSecondClick: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button');
        await userEvent.click(trigger);
        await expect(canvas.getByRole('dialog')).toBeInTheDocument();
        await userEvent.click(trigger);
        await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    },
};
