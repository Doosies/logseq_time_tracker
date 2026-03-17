import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import type { UserScript } from '#types/user_script';
import ScriptEditorStoryWrapper from './ScriptEditorStoryWrapper.svelte';

/**
 * [FEATURE_TOGGLE] run_at 옵션 비활성화됨 (2026-03-09)
 * 모든 mock은 run_at: 'document_idle' 사용.
 * 복원 시: ScriptEditor.svelte의 run_at Select UI 복원 후 document_start 스토리 추가 가능.
 */
const MOCK_SCRIPT: UserScript = {
    id: 'script-1',
    name: '편집할 스크립트',
    enabled: true,
    url_patterns: ['*://zeus*.ecount.com/*'],
    code: "console.log('edit me');",
    run_at: 'document_idle',
    created_at: Date.now(),
    updated_at: Date.now(),
};

const meta = {
    component: ScriptEditorStoryWrapper,
    title: 'ecount-dev-tool/UserScriptSection/ScriptEditor',
    parameters: {
        docs: {
            description: {
                component: '스크립트 추가/수정 폼',
            },
        },
    },
    argTypes: {
        script: {
            control: false,
            description: '수정 모드 시 기존 스크립트',
        },
        initialScripts: {
            control: false,
            description: '스토어 초기 데이터 (EditMode 시 필요)',
        },
    },
} satisfies Meta<typeof ScriptEditorStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        script: undefined,
        initialScripts: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByPlaceholderText('스크립트 이름')).toBeInTheDocument();
        await expect(canvas.getByPlaceholderText('*://zeus*.ecount.com/*')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '취소' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '저장' })).toBeInTheDocument();
    },
};

export const EditMode: Story = {
    args: {
        script: MOCK_SCRIPT,
        initialScripts: [MOCK_SCRIPT],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByDisplayValue('편집할 스크립트')).toBeInTheDocument();
        const code_editor = canvas.getByTestId('code-editor');
        await expect(code_editor).toHaveTextContent("console.log('edit me');");

        const name_input = canvas.getByPlaceholderText('스크립트 이름');
        await userEvent.clear(name_input);
        await userEvent.type(name_input, '수정된 이름');
        await expect(canvas.getByDisplayValue('수정된 이름')).toBeInTheDocument();
    },
};

export const CreateMode: Story = {
    args: {
        script: undefined,
        initialScripts: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const name_input = canvas.getByPlaceholderText('스크립트 이름');
        await userEvent.type(name_input, '새 스크립트');

        const code_editor = canvas.getByTestId('code-editor');
        const code_textbox = code_editor.querySelector('[contenteditable="true"]');
        if (code_textbox) {
            await userEvent.click(code_textbox as HTMLElement);
            await userEvent.keyboard("alert('hello');");
        }

        await expect(canvas.getByRole('button', { name: '저장' })).not.toBeDisabled();
        await expect(canvas.getByRole('button', { name: '취소' })).toBeInTheDocument();
    },
};
