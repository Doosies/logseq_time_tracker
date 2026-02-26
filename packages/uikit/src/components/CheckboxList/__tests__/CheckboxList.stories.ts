import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
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
