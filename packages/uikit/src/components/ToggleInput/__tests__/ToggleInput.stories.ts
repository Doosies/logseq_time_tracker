import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import ToggleInputStoryWrapper from './ToggleInputStoryWrapper.svelte';

const meta = {
    component: ToggleInputStoryWrapper,
    title: 'uikit/ToggleInput',
    args: {
        onToggle: fn(),
        onchange: fn(),
    },
    argTypes: {
        isTextMode: { control: 'boolean' },
        prefix: { control: 'text' },
    },
} satisfies Meta<typeof ToggleInputStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectMode: Story = {
    args: { isTextMode: false },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toBeInTheDocument();
        const toggle_btn = canvas.getByRole('button', { name: 'Toggle input mode' });
        await expect(toggle_btn).toBeInTheDocument();
        await expect(toggle_btn).toHaveTextContent('✏️');
    },
};

export const TextMode: Story = {
    args: { isTextMode: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toBeInTheDocument();
        const toggle_btn = canvas.getByRole('button', { name: 'Toggle input mode' });
        await expect(toggle_btn).toHaveTextContent('🔽');
    },
};

export const WithPrefix: Story = {
    args: { prefix: 'Server:' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Server:')).toBeInTheDocument();
    },
};

export const ToggleClick: Story = {
    args: {},
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const toggle_btn = canvas.getByRole('button', { name: 'Toggle input mode' });
        await userEvent.click(toggle_btn);
        await expect(args['onToggle']).toHaveBeenCalledOnce();
    },
};

export const SelectChange: Story = {
    args: { isTextMode: false },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByRole('combobox');
        await userEvent.selectOptions(select, 'b');
        await expect(args['onchange']).toHaveBeenCalledWith('b');
    },
};

export const TextInput: Story = {
    args: { isTextMode: true },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');
        await userEvent.type(input, 'hello');
        await expect(args['onchange']).toHaveBeenCalled();
    },
};

export const EmptyPrefix: Story = {
    args: { prefix: '' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByText('Server:')).not.toBeInTheDocument();
    },
};
