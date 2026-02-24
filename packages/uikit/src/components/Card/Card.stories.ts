import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import CardStoryWrapper from './CardStoryWrapper.svelte';

const meta = {
    component: CardStoryWrapper,
    title: 'uikit/Card',
    argTypes: {
        scenario: {
            control: 'select',
            options: ['default', 'withComponents'],
        },
    },
} satisfies Meta<typeof CardStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { scenario: 'default' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('카드 기본 내용')).toBeInTheDocument();
    },
};

export const WithComponents: Story = {
    args: { scenario: 'withComponents' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('카드 제목')).toBeInTheDocument();
        await expect(canvas.getByRole('button')).toBeInTheDocument();
    },
};
