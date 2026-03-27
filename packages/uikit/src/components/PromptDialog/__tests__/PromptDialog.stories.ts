import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import PromptDialogStoryWrapper from './PromptDialogStoryWrapper.svelte';

const meta = {
    component: PromptDialogStoryWrapper,
    title: 'uikit/PromptDialog',
    parameters: {
        docs: {
            description: {
                component: '사유·프롬프트를 입력받는 모달 다이얼로그',
            },
        },
    },
    args: {
        onconfirm: fn(),
        oncancel: fn(),
    },
    argTypes: {
        title: { control: 'text', description: '다이얼로그 제목' },
        description: { control: 'text', description: '본문 설명' },
        placeholder: { control: 'text', description: '텍스트 영역 placeholder' },
        onconfirm: { description: '확인 시 호출', action: 'confirm' },
        oncancel: { description: '취소 시 호출', action: 'cancel' },
    },
} satisfies Meta<typeof PromptDialogStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: '작업 확인',
        description: '계속하려면 사유를 입력하세요.',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('dialog', { name: '작업 확인' })).toBeInTheDocument();
        await expect(canvas.getByRole('textbox')).toBeInTheDocument();
    },
};

export const WithConfirm: Story = {
    args: {
        title: '삭제 확인',
        description: '',
        allow_empty: false,
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const textbox = canvas.getByRole('textbox');
        await userEvent.type(textbox, '테스트 사유');
        await userEvent.click(canvas.getByRole('button', { name: '확인' }));
        await expect((args as Record<string, unknown>)['onconfirm']).toHaveBeenCalledWith('테스트 사유');
    },
};
