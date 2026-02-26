import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import ServerManagerStoryWrapper from './ServerManagerStoryWrapper.svelte';

const meta = {
    component: ServerManagerStoryWrapper,
    title: 'ecount-dev-tool/ServerManager',
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
    },
};

export const TestEnvironment: Story = {
    args: {
        url: 'https://onetestba1.ecount.com/ec5/view/erp?__v3domains=test',
    },
};

export const UnsupportedEnvironment: Story = {
    args: {
        url: 'https://other.ecount.com/some/path',
    },
};
