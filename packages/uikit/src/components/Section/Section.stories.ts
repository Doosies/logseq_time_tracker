import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import SectionStoryWrapper from './SectionStoryWrapper.svelte';

const meta = {
    component: SectionStoryWrapper,
    title: 'uikit/Section',
    argTypes: {
        title: { control: 'text' },
        scenario: {
            control: 'select',
            options: ['withTitle', 'withoutTitle', 'longContent'],
        },
    },
} satisfies Meta<typeof SectionStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTitle: Story = {
    args: { title: '섹션 제목', scenario: 'withTitle' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('섹션 제목')).toBeInTheDocument();
        await expect(canvas.getByText('섹션 내용입니다.')).toBeInTheDocument();
    },
};

export const WithoutTitle: Story = {
    args: { scenario: 'withoutTitle' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByText('섹션 제목')).not.toBeInTheDocument();
        await expect(canvas.getByText('제목 없는 섹션 내용')).toBeInTheDocument();
    },
};

export const LongContent: Story = {
    args: { title: '긴 내용', scenario: 'longContent' },
};
