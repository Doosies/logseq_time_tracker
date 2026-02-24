import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import QuickLoginSection from '../QuickLoginSection.svelte';

const meta = {
  component: QuickLoginSection,
  title: 'ecount-dev-tool/QuickLoginSection',
} satisfies Meta<typeof QuickLoginSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAccounts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.queryAllByRole('button');
    await expect(buttons.length).toBeGreaterThan(0);
  },
};

export const EmptyAccounts: Story = {};
