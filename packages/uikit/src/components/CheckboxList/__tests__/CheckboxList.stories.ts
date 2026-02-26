import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import CheckboxListStoryWrapper from './CheckboxListStoryWrapper.svelte';

const meta = {
    component: CheckboxListStoryWrapper,
    title: 'uikit/CheckboxList',
} satisfies Meta<typeof CheckboxListStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('checkbox')).toHaveLength(3);
    },
};

export const WithDisabled: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const checkboxes = canvas.getAllByRole('checkbox');
        const disabled_checkbox = checkboxes.find((cb) => (cb as HTMLInputElement).disabled);
        await expect(disabled_checkbox).toBeTruthy();
    },
};

export const ToggleChecked: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const checkboxes = canvas.getAllByRole('checkbox');
        const checkbox_b = checkboxes[1];
        if (!checkbox_b) throw new Error('Expected checkbox at index 1');
        // Item B (index 1)는 unchecked
        await expect(checkbox_b).not.toBeChecked();
        await userEvent.click(checkbox_b);
        await expect(checkbox_b).toBeChecked();
    },
};

export const DisabledCannotToggle: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const checkboxes = canvas.getAllByRole('checkbox');
        // Item A (index 0)는 유일한 visible → disabled
        const disabled_cb = checkboxes[0];
        await expect(disabled_cb).toBeDisabled();
        await expect(disabled_cb).toBeChecked();
    },
};

export const ItemLabelsRendered: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Item A')).toBeInTheDocument();
        await expect(canvas.getByText('Item B')).toBeInTheDocument();
        await expect(canvas.getByText('Item C')).toBeInTheDocument();
    },
};
