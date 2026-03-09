import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import type { UserScript } from '#types/user_script';
import ScriptListStoryWrapper from './ScriptListStoryWrapper.svelte';

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
    component: ScriptListStoryWrapper,
    title: 'ecount-dev-tool/UserScriptSection/ScriptList',
    parameters: {
        docs: {
            description: {
                component: '사용자 스크립트 목록 (실행/수정/삭제 버튼)',
            },
        },
    },
    argTypes: {
        initialScripts: {
            control: false,
            description: '스토리 초기 스크립트 목록',
        },
    },
} satisfies Meta<typeof ScriptListStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        initialScripts: [MOCK_SCRIPT],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('테스트 스크립트')).toBeInTheDocument();
        await expect(canvas.getByLabelText('스크립트 실행')).toBeInTheDocument();
        await expect(canvas.getByLabelText('스크립트 수정')).toBeInTheDocument();
        await expect(canvas.getByLabelText('스크립트 삭제')).toBeInTheDocument();
    },
};

export const WithMultipleScripts: Story = {
    args: {
        initialScripts: [
            MOCK_SCRIPT,
            {
                ...MOCK_SCRIPT,
                id: 'script-2',
                name: '두 번째 스크립트',
                url_patterns: ['*://*.ecount.com/*'],
            } as UserScript,
            {
                ...MOCK_SCRIPT,
                id: 'script-3',
                name: '비활성 스크립트',
                enabled: false,
            } as UserScript,
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('테스트 스크립트')).toBeInTheDocument();
        await expect(canvas.getByText('두 번째 스크립트')).toBeInTheDocument();
        await expect(canvas.getByText('비활성 스크립트')).toBeInTheDocument();

        const run_btns = canvas.getAllByLabelText('스크립트 실행');
        await expect(run_btns.length).toBe(3);
        await userEvent.click(run_btns[0]!);
    },
};

export const Empty: Story = {
    args: {
        initialScripts: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('스크립트가 없습니다. 추가 버튼을 눌러 등록하세요.')).toBeInTheDocument();
    },
};
