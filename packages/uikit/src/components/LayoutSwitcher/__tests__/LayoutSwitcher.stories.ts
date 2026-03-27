import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, waitFor } from 'storybook/test';
import LayoutSwitcherStoryWrapper from './LayoutSwitcherStoryWrapper.svelte';

const meta = {
    component: LayoutSwitcherStoryWrapper,
    title: 'uikit/LayoutSwitcher',
    parameters: {
        docs: {
            description: {
                component: '컨테이너 너비에 따라 compact/full 레이아웃 모드를 전달하는 래퍼',
            },
        },
    },
    argTypes: {
        breakpoint: { control: 'number', description: 'full 모드로 전환되는 최소 너비(px)' },
        width_px: { control: 'number', description: '스토리용 컨테이너 너비(px)' },
    },
} satisfies Meta<typeof LayoutSwitcherStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullLayout: Story = {
    args: { breakpoint: 600, width_px: 800 },
};

export const CompactLayout: Story = {
    args: { breakpoint: 600, width_px: 400 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitFor(() => {
            expect(canvas.getByTestId('layout-mode')).toHaveTextContent('레이아웃: compact');
        });
    },
};

export const CustomBreakpoint: Story = {
    args: { breakpoint: 900, width_px: 700 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitFor(() => {
            expect(canvas.getByTestId('layout-mode')).toHaveTextContent('레이아웃: compact');
        });
    },
};
