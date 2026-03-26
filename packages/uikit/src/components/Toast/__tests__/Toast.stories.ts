import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import ToastStoryWrapper from './ToastStoryWrapper.svelte';
import ToastLevelStoryWrapper from './ToastLevelStoryWrapper.svelte';

const meta = {
    component: ToastStoryWrapper,
    title: 'uikit/Toast',
    parameters: {
        docs: {
            description: {
                component: '일시적 알림 메시지를 표시하는 토스트 컴포넌트',
            },
        },
        a11y: {
            config: {
                rules: [{ id: 'region', enabled: false }],
            },
        },
    },
} satisfies Meta<typeof ToastStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    },
};

export const ShowToast: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: '토스트 표시' });
        await userEvent.click(trigger);
        await expect(canvas.getByRole('status')).toBeInTheDocument();
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
        const statuses = canvas.getAllByRole('status');
        await expect(statuses.length).toBeGreaterThanOrEqual(2);
    },
};

export const ToastHasContent: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: '토스트 표시' });
        await userEvent.click(trigger);
        const status = canvas.getByRole('status');
        await expect(status).toHaveTextContent('에러 메시지입니다.');
    },
};

export const ToastLevelInfo: Story = {
    render: () => ({ Component: ToastLevelStoryWrapper }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: '토스트 info 표시' }));
        const status = canvas.getByRole('status');
        await expect(status).toHaveAttribute('data-level', 'info');
        await expect(status).toHaveTextContent('info 메시지');
    },
};

export const ToastLevelSuccess: Story = {
    render: () => ({ Component: ToastLevelStoryWrapper }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: '토스트 success 표시' }));
        const status = canvas.getByRole('status');
        await expect(status).toHaveAttribute('data-level', 'success');
        await expect(status).toHaveTextContent('success 메시지');
    },
};

export const ToastLevelWarning: Story = {
    render: () => ({ Component: ToastLevelStoryWrapper }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: '토스트 warning 표시' }));
        const status = canvas.getByRole('status');
        await expect(status).toHaveAttribute('data-level', 'warning');
        await expect(status).toHaveTextContent('warning 메시지');
    },
};

export const ToastLevelError: Story = {
    render: () => ({ Component: ToastLevelStoryWrapper }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: '토스트 error 표시' }));
        const status = canvas.getByRole('status');
        await expect(status).toHaveAttribute('data-level', 'error');
        await expect(status).toHaveTextContent('error 메시지');
    },
};
