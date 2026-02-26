import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import SectionStoryWrapper from './SectionStoryWrapper.svelte';

const meta = {
    component: SectionStoryWrapper,
    title: 'uikit/Section',
    argTypes: {
        title: { control: 'text', description: '섹션 제목' },
        scenario: {
            control: 'select',
            options: ['withTitle', 'withoutTitle', 'longContent', 'withAction'],
            description: '섹션 레이아웃 시나리오',
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

export const WithAction: Story = {
    args: { title: '섹션 제목', scenario: 'withAction' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('섹션 제목')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '편집' })).toBeInTheDocument();
    },
};

export const LongContentRendered: Story = {
    args: { title: '긴 내용', scenario: 'longContent' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('긴 내용')).toBeInTheDocument();
        await expect(canvas.getByText('첫 번째 단락')).toBeInTheDocument();
        await expect(canvas.getByText('두 번째 단락')).toBeInTheDocument();
    },
};
