import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import ServerManagerStoryWrapper from './ServerManagerStoryWrapper.svelte';

const meta = {
    component: ServerManagerStoryWrapper,
    title: 'ecount-dev-tool/ServerManager',
    parameters: {
        docs: {
            description: {
                component: '서버 환경을 전환하는 관리 컴포넌트',
            },
        },
    },
    argTypes: {
        url: { control: 'text', description: '현재 탭 URL (서버 환경 결정)' },
    },
} satisfies Meta<typeof ServerManagerStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ZeusEnvironment: Story = {
    args: {
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('V5')).toBeInTheDocument();
        await expect(canvas.getByText('V3')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '서버 적용' })).toBeInTheDocument();
        const comboboxes = canvas.getAllByRole('combobox');
        await expect(comboboxes).toHaveLength(2);
    },
};

export const TestEnvironment: Story = {
    args: {
        url: 'https://onetestba1.ecount.com/ec5/view/erp?__v3domains=test',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('V5')).toBeInTheDocument();
        await expect(canvas.getByText('V3')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '서버 적용' })).toBeInTheDocument();
        const textboxes = canvas.getAllByRole('textbox');
        await expect(textboxes).toHaveLength(2);
        const comboboxes = canvas.queryAllByRole('combobox');
        await expect(comboboxes).toHaveLength(0);
    },
};

export const UnsupportedEnvironment: Story = {
    args: {
        url: 'https://other.ecount.com/some/path',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('V5')).toBeInTheDocument();
        await expect(canvas.getByText('V3')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '서버 적용' })).toBeInTheDocument();
    },
};
