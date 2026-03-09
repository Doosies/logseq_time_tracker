import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import DialogStoryWrapper from './DialogStoryWrapper.svelte';

const meta = {
    component: DialogStoryWrapper,
    title: 'uikit/Dialog',
    parameters: {
        docs: {
            description: {
                component:
                    '트리거 클릭 시 모달 다이얼로그를 표시하는 컴포넌트. ESC 키 및 배경 클릭으로 닫을 수 있습니다.',
            },
        },
        a11y: {
            config: {
                rules: [{ id: 'region', enabled: false }],
            },
        },
    },
    argTypes: {
        title: { control: 'text', description: '다이얼로그 제목' },
        description: { control: 'text', description: '다이얼로그 설명' },
        showForm: { control: 'boolean', description: '폼 포함 여부' },
    },
} satisfies Meta<typeof DialogStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 모달. 열기 버튼 클릭 → 모달 표시 → ESC 키로 닫기
 */
export const Default: Story = {
    args: {
        title: '스크립트 추가',
        description: '새로운 사용자 스크립트를 등록합니다.',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body_canvas = within(document.body);

        const trigger = canvas.getByRole('button', { name: '열기' });
        await expect(trigger).toBeInTheDocument();
        await expect(body_canvas.queryByRole('dialog')).not.toBeInTheDocument();

        await userEvent.click(trigger);
        const dialog = body_canvas.getByRole('dialog');
        await expect(dialog).toBeInTheDocument();
        await expect(body_canvas.getByText('스크립트 추가')).toBeInTheDocument();
        await expect(body_canvas.getByText('새로운 사용자 스크립트를 등록합니다.')).toBeInTheDocument();

        await userEvent.click(dialog);
        await userEvent.keyboard('{Escape}');
        await waitFor(() => {
            expect(body_canvas.queryByRole('dialog')).not.toBeInTheDocument();
        });
    },
};

/**
 * 폼이 있는 모달. 포커스 트랩 및 배경 클릭으로 닫기 확인
 */
export const WithForm: Story = {
    args: {
        title: '스크립트 수정',
        showForm: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body_canvas = within(document.body);

        const trigger = canvas.getByRole('button', { name: '열기' });
        await userEvent.click(trigger);

        const dialog = body_canvas.getByRole('dialog');
        await expect(dialog).toBeInTheDocument();

        await waitFor(() => {
            expect(document.activeElement).not.toBeNull();
            expect(dialog.contains(document.activeElement)).toBe(true);
        });

        const overlay = document.body.querySelector('[data-dialog-overlay]');
        expect(overlay).toBeInTheDocument();
        await userEvent.click(overlay as HTMLElement);

        await expect(body_canvas.queryByRole('dialog')).not.toBeInTheDocument();
    },
};
