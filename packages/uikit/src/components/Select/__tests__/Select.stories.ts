import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import Select from '../Select.svelte';

const default_options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
];

const many_options = Array.from({ length: 10 }, (_, i) => ({
    value: 'opt' + i,
    label: 'Option ' + (i + 1),
}));

const meta = {
    component: Select,
    title: 'uikit/Select',
    parameters: {
        docs: {
            description: {
                component: '옵션 목록에서 하나를 선택하는 드롭다운 컴포넌트',
            },
        },
        a11y: {
            config: {
                rules: [{ id: 'region', enabled: false }],
            },
        },
    },
    args: {
        onchange: fn(),
    },
    argTypes: {
        options: { description: '선택 가능한 옵션 목록' },
        onchange: { description: '값 변경 이벤트 핸들러', action: 'changed' },
        disabled: { control: 'boolean', description: '비활성화 상태' },
        value: { control: 'text', description: '선택된 값' },
    },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { options: default_options },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toBeInTheDocument();
        await expect(canvas.getByText('Option A')).toBeInTheDocument();
        await expect(canvas.getByText('Option B')).toBeInTheDocument();
        await expect(canvas.getByText('Option C')).toBeInTheDocument();
    },
};

export const WithInitialValue: Story = {
    args: { options: default_options, value: 'b' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toHaveValue('b');
    },
};

export const Disabled: Story = {
    args: { options: default_options, disabled: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toBeDisabled();
    },
};

export const ManyOptions: Story = {
    args: { options: many_options },
};

export const WithChangeHandler: Story = {
    args: { options: default_options },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByRole('combobox');
        await userEvent.selectOptions(select, 'b');
        await expect((args as Record<string, unknown>)['onchange']).toHaveBeenCalledWith('b');
    },
};

export const EmptyOptions: Story = {
    args: { options: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByRole('combobox');
        await expect(select).toBeInTheDocument();
        await expect(select.querySelectorAll('option')).toHaveLength(0);
    },
};
