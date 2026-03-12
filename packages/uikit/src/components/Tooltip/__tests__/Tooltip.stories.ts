import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import { screen } from '@testing-library/svelte';
import TooltipStoryWrapper from './TooltipStoryWrapper.svelte';

const meta = {
    component: TooltipStoryWrapper,
    title: 'uikit/Tooltip',
    parameters: {
        docs: {
            description: {
                component: '호버 시 추가 정보를 표시하는 툴팁 컴포넌트',
            },
        },
    },
    argTypes: {
        content: { control: 'text', description: '툴팁에 표시할 텍스트' },
        position: {
            control: 'select',
            options: ['top', 'bottom', 'left', 'right'],
            description: '툴팁 표시 위치',
        },
        disabled: { control: 'boolean', description: '비활성화 시 호버해도 툴팁 미표시' },
        scenario: {
            control: 'select',
            options: ['default', 'all-positions', 'long-content', 'disabled', 'with-button'],
            description: '스토리 시나리오',
        },
    },
} satisfies Meta<typeof TooltipStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { content: '툴팁 내용', position: 'top', scenario: 'default' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: '호버 대상' });
        await expect(trigger).toBeInTheDocument();
        await userEvent.hover(trigger);
        const tooltip = screen.getByRole('tooltip');
        await expect(tooltip).toBeInTheDocument();
        await expect(tooltip).toHaveTextContent('툴팁 내용');
    },
};

export const AllPositions: Story = {
    args: { scenario: 'all-positions' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const top_trigger = canvas.getByRole('button', { name: 'Top' });
        await expect(top_trigger).toBeInTheDocument();
        await userEvent.hover(top_trigger);
        const tooltip = screen.getByRole('tooltip');
        await expect(tooltip).toHaveTextContent('상단 툴팁');
    },
};

export const LongContent: Story = {
    args: { scenario: 'long-content' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: '긴 내용 호버' });
        await expect(trigger).toBeInTheDocument();
        await userEvent.hover(trigger);
        const tooltip = screen.getByRole('tooltip');
        await expect(tooltip).toBeInTheDocument();
        await expect(tooltip).toHaveTextContent('이것은 매우 긴 툴팁 텍스트입니다');
    },
};

export const Disabled: Story = {
    args: { scenario: 'disabled' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: '호버해도 표시 안 됨' });
        await expect(trigger).toBeInTheDocument();
        await userEvent.hover(trigger);
        await expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    },
};

export const WithButton: Story = {
    args: { content: '실제 사용 예시', position: 'top', scenario: 'with-button' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: '버튼에 툴팁' });
        await expect(button).toBeInTheDocument();
        await userEvent.hover(button);
        const tooltip = screen.getByRole('tooltip');
        await expect(tooltip).toHaveTextContent('실제 사용 예시');
    },
};
