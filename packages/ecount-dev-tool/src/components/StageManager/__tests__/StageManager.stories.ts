import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import StageManagerStoryWrapper from './StageManagerStoryWrapper.svelte';

const meta = {
    component: StageManagerStoryWrapper,
    title: 'ecount-dev-tool/StageManager',
    parameters: {
        docs: {
            description: {
                component: 'Stage 서버 전환 관리 (stageba ↔ stagelxba2)',
            },
        },
    },
    argTypes: {
        url: {
            control: 'text',
            description: '현재 탭 URL (stage 환경에 따라 버튼 라벨 변경)',
        },
    },
} satisfies Meta<typeof StageManagerStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        url: 'https://stageba.ecount.com/ec5/view/erp',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Stage Server Manager')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'stageba2로 전환' })).toBeInTheDocument();

        await userEvent.click(canvas.getByRole('button', { name: 'stageba2로 전환' }));
    },
};

export const WithDifferentServers: Story = {
    args: {
        url: 'https://stagelxba2.ecount.com/ec5/view/erp',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Stage Server Manager')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'stageba1로 전환' })).toBeInTheDocument();

        await userEvent.click(canvas.getByRole('button', { name: 'stageba1로 전환' }));
    },
};
