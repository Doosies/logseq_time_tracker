import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within } from 'storybook/test';
import DatePickerStoryWrapper from './DatePickerStoryWrapper.svelte';

const meta = {
    component: DatePickerStoryWrapper,
    title: 'uikit/DatePicker',
    parameters: {
        docs: {
            description: {
                component: '달력 패널로 날짜를 선택하는 컴포넌트',
            },
        },
    },
    args: {
        onSelect: fn(),
    },
    argTypes: {
        value: { control: 'text', description: '선택된 날짜(YYYY-MM-DD) 또는 비어 있음' },
        onSelect: { description: '날짜 선택 시 호출', action: 'select' },
        min: { control: 'text', description: '선택 가능 최소 날짜' },
        max: { control: 'text', description: '선택 가능 최대 날짜' },
        locale: { control: 'text', description: '로케일' },
    },
} satisfies Meta<typeof DatePickerStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { value: null },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: /날짜 선택/i })).toBeInTheDocument();
    },
};

export const WithSelectedDate: Story = {
    args: { value: '2025-06-15' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: '2025-06-15' })).toBeInTheDocument();
    },
};
