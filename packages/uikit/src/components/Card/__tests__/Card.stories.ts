import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import CardStoryWrapper from './CardStoryWrapper.svelte';

const meta = {
    component: CardStoryWrapper,
    title: 'uikit/Card',
    parameters: {
        docs: {
            description: {
                component: 'Header, Body, Footer로 구성된 컨테이너 카드 컴포넌트',
            },
        },
    },
    argTypes: {
        scenario: {
            control: 'select',
            options: ['default', 'withComponents', 'headerFooterOnly', 'allParts'],
            description: '카드 레이아웃 시나리오',
        },
    },
} satisfies Meta<typeof CardStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { scenario: 'default' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('카드 헤더')).toBeInTheDocument();
        await expect(canvas.getByText('카드 기본 내용')).toBeInTheDocument();
    },
};

export const HeaderAndFooterOnly: Story = {
    args: { scenario: 'headerFooterOnly' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('카드 헤더')).toBeInTheDocument();
        await expect(canvas.getByText('카드 푸터')).toBeInTheDocument();
    },
};

export const AllParts: Story = {
    args: { scenario: 'allParts' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('카드 헤더')).toBeInTheDocument();
        await expect(canvas.getByText('카드 기본 내용')).toBeInTheDocument();
        await expect(canvas.getByText('카드 푸터')).toBeInTheDocument();
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
