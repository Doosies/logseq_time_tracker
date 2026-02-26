import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import ToastStoryWrapper from './ToastStoryWrapper.svelte';

const meta = {
    component: ToastStoryWrapper,
    title: 'uikit/Toast',
} satisfies Meta<typeof ToastStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    },
};

export const ShowToast: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: '토스트 표시' });
        await userEvent.click(trigger);
        await expect(canvas.getByRole('alert')).toBeInTheDocument();
        await expect(canvas.getByText('에러 메시지입니다.')).toBeInTheDocument();
    },
};

export const MultipleToasts: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: '토스트 표시' });
        await userEvent.click(trigger);
        await userEvent.click(trigger);
        await userEvent.click(trigger);
        const alerts = canvas.getAllByRole('alert');
        await expect(alerts.length).toBeGreaterThanOrEqual(2);
    },
};

export const ToastHasContent: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: '토스트 표시' });
        await userEvent.click(trigger);
        const alert = canvas.getByRole('alert');
        await expect(alert).toHaveTextContent('에러 메시지입니다.');
    },
};
