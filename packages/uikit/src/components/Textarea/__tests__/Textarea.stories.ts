import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import Textarea from '../Textarea.svelte';

const meta = {
    component: Textarea,
    title: 'uikit/Textarea',
    parameters: {
        docs: {
            description: {
                component: '멀티라인 텍스트 입력 컴포넌트. 코드 에디터용 monospace 모드 지원',
            },
        },
    },
    args: {
        oninput: fn(),
    },
    argTypes: {
        oninput: { description: '텍스트 입력 이벤트 핸들러', action: 'input' },
        disabled: { control: 'boolean', description: '비활성화 상태' },
        placeholder: { control: 'text', description: '플레이스홀더 텍스트' },
        value: { control: 'text', description: '입력 값' },
        rows: { control: 'number', description: '표시 줄 수' },
        monospace: { control: 'boolean', description: '코드 편집용 고정폭 폰트' },
    },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByRole('textbox');
        await expect(textarea).toBeInTheDocument();
        await expect(textarea).not.toBeDisabled();
    },
};

export const WithPlaceholder: Story = {
    args: { placeholder: '여기에 입력하세요...' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByPlaceholderText('여기에 입력하세요...')).toBeInTheDocument();
    },
};

export const WithValue: Story = {
    args: { value: '초기 텍스트 값' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toHaveValue('초기 텍스트 값');
    },
};

export const Disabled: Story = {
    args: { disabled: true, value: '비활성화된 텍스트' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toBeDisabled();
    },
};

export const Monospace: Story = {
    args: { monospace: true, value: 'console.log("hello");', rows: 5 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toBeInTheDocument();
    },
};

export const CustomRows: Story = {
    args: { rows: 8, placeholder: '8줄 높이 텍스트 영역' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByRole('textbox');
        await expect(textarea).toHaveAttribute('rows', '8');
    },
};

export const WithInputHandler: Story = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByRole('textbox');
        await userEvent.type(textarea, 'hello world');
        await expect(args['oninput']).toHaveBeenCalled();
    },
};
