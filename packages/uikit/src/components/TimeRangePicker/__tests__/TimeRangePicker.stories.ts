import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within } from 'storybook/test';
import TimeRangePickerStoryWrapper from './TimeRangePickerStoryWrapper.svelte';

const meta = {
    component: TimeRangePickerStoryWrapper,
    title: 'uikit/TimeRangePicker',
    parameters: {
        docs: {
            description: {
                component: '시작·종료 날짜와 시각으로 범위를 선택하는 컴포넌트',
            },
        },
    },
    args: {
        onChange: fn(),
    },
    argTypes: {
        started_at: { control: 'text', description: '시작 시각(UTC ISO)' },
        ended_at: { control: 'text', description: '종료 시각(UTC ISO)' },
        onChange: { description: '유효 범위 변경 시 호출', action: 'change' },
        start_label: { control: 'text' },
        end_label: { control: 'text' },
    },
} satisfies Meta<typeof TimeRangePickerStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const default_start = '2025-03-10T09:00:00.000Z';
const default_end = '2025-03-10T18:00:00.000Z';

export const Default: Story = {
    args: {
        started_at: default_start,
        ended_at: default_end,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const triggers = canvas.getAllByRole('button');
        await expect(triggers.length).toBeGreaterThanOrEqual(2);
    },
};

export const WithPrefilledRange: Story = {
    args: {
        started_at: '2025-12-01T00:00:00.000Z',
        ended_at: '2025-12-31T23:59:00.000Z',
        start_label: '시작일시',
        end_label: '종료일시',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('시작일시')).toBeInTheDocument();
        await expect(canvas.getByText('종료일시')).toBeInTheDocument();
    },
};
