import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import QuickLoginSection from '../QuickLoginSection.svelte';

const meta = {
    component: QuickLoginSection,
    title: 'ecount-dev-tool/QuickLoginSection',
    parameters: {
        docs: {
            description: {
                component: '저장된 계정으로 빠르게 로그인하는 섹션',
            },
        },
    },
    argTypes: {
        scenario: {
            control: false,
            description: '테스트 시나리오 설명',
        },
    },
} satisfies Meta<typeof QuickLoginSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAccounts: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.queryAllByRole('button');
        await expect(buttons.length).toBeGreaterThan(0);
    },
};

export const EmptyAccounts: Story = {};
