import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import ElapsedTimerStoryWrapper from './ElapsedTimerStoryWrapper.svelte';

const meta = {
    component: ElapsedTimerStoryWrapper,
    title: 'uikit/ElapsedTimer',
    parameters: {
        docs: {
            description: {
                component: '누적·구간 기준으로 경과 시간을 표시하는 타이머',
            },
        },
    },
    argTypes: {
        accumulated_ms: { control: 'number', description: '누적 경과(ms)' },
        segment_start: { control: 'text', description: '현재 구간 시작 시각(ISO), 없으면 정지 표시' },
        is_paused: { control: 'boolean', description: '일시정지 여부' },
        label: { control: 'text', description: 'aria-label' },
    },
} satisfies Meta<typeof ElapsedTimerStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stopped: Story = {
    args: {
        accumulated_ms: 125_000,
        segment_start: null,
        is_paused: true,
        label: '경과 시간',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('timer', { name: '경과 시간' })).toHaveTextContent('00:02:05');
    },
};

export const RunningStatic: Story = {
    args: {
        accumulated_ms: 60_000,
        segment_start: null,
        is_paused: false,
        label: '실행 중(정적)',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('timer')).toHaveTextContent('00:01:00');
    },
};

export const Paused: Story = {
    args: {
        accumulated_ms: 3_660_000,
        segment_start: new Date().toISOString(),
        is_paused: true,
        label: '일시정지',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('timer', { name: '일시정지' })).toBeInTheDocument();
    },
};

export const CustomFormatter: Story = {
    args: {
        accumulated_ms: 0,
        segment_start: null,
        is_paused: true,
        label: '커스텀 포맷',
        formatter: (sec: number) => `${sec}초`,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('timer')).toHaveTextContent('0초');
    },
};
