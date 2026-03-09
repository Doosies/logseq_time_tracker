import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import type { UserScript } from '#types/user_script';
import UserScriptSectionStoryWrapper from './UserScriptSectionStoryWrapper.svelte';

const MOCK_SCRIPT: UserScript = {
    id: 'script-1',
    name: '테스트 스크립트',
    enabled: true,
    url_patterns: ['*://zeus*.ecount.com/*'],
    code: "console.log('hello');",
    run_at: 'document_idle',
    created_at: Date.now(),
    updated_at: Date.now(),
};

const meta = {
    component: UserScriptSectionStoryWrapper,
    title: 'ecount-dev-tool/UserScriptSection',
    parameters: {
        docs: {
            description: {
                component: '사용자 스크립트 목록 및 편집 섹션',
            },
        },
    },
    argTypes: {
        initialScripts: {
            control: false,
            description: '스토리 초기 스크립트 목록',
        },
    },
} satisfies Meta<typeof UserScriptSectionStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        initialScripts: [MOCK_SCRIPT],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('사용자 스크립트')).toBeInTheDocument();
        await expect(canvas.getByText('테스트 스크립트')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '+ 추가' })).toBeInTheDocument();

        const add_btn = canvas.getByRole('button', { name: '+ 추가' });
        await userEvent.click(add_btn);
        await expect(canvas.getByPlaceholderText('스크립트 이름')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '취소' })).toBeInTheDocument();
    },
};

export const WithScripts: Story = {
    args: {
        initialScripts: [
            MOCK_SCRIPT,
            {
                ...MOCK_SCRIPT,
                id: 'script-2',
                name: '두 번째 스크립트',
                url_patterns: ['*://*.ecount.com/*'],
            } as UserScript,
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('테스트 스크립트')).toBeInTheDocument();
        await expect(canvas.getByText('두 번째 스크립트')).toBeInTheDocument();

        const edit_btns = canvas.getAllByLabelText('스크립트 수정');
        await expect(edit_btns.length).toBeGreaterThan(0);
        await userEvent.click(edit_btns[0]!);
        await expect(canvas.getByDisplayValue('테스트 스크립트')).toBeInTheDocument();
    },
};

export const Empty: Story = {
    args: {
        initialScripts: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('사용자 스크립트')).toBeInTheDocument();
        await expect(canvas.getByText('스크립트가 없습니다. 추가 버튼을 눌러 등록하세요.')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '+ 추가' })).toBeInTheDocument();

        await userEvent.click(canvas.getByRole('button', { name: '+ 추가' }));
        await expect(canvas.getByPlaceholderText('스크립트 이름')).toBeInTheDocument();
    },
};
