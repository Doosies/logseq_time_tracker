import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import DndStoryWrapper from './DndStoryWrapper.svelte';

const meta = {
    component: DndStoryWrapper,
    title: 'uikit/Dnd',
    parameters: {
        docs: {
            description: {
                component: '드래그 앤 드롭으로 항목 순서를 변경하는 컴포넌트',
            },
        },
        a11y: {
            config: {
                rules: [{ id: 'region', enabled: false }],
            },
        },
    },
    argTypes: {
        scenario: {
            control: false,
            description: '테스트 시나리오 설명',
        },
    },
} satisfies Meta<typeof DndStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Row 1')).toBeInTheDocument();
        await expect(canvas.getByText('Row 2')).toBeInTheDocument();
        await expect(canvas.getByText('Row 3')).toBeInTheDocument();
    },
};

export const HasDragHandles: Story = {
    play: async ({ canvasElement }) => {
        const handles = canvasElement.querySelectorAll('[data-drag-handle]');
        await expect(handles.length).toBe(3);
    },
};

export const HandleHasAriaLabel: Story = {
    play: async ({ canvasElement }) => {
        const handles = canvasElement.querySelectorAll('[data-drag-handle]');
        for (const handle of handles) {
            await expect(handle).toHaveAttribute('aria-label');
        }
    },
};
