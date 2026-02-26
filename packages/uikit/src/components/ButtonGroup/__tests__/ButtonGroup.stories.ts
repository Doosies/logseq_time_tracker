import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within } from 'storybook/test';
import ButtonGroupStoryWrapper from './ButtonGroupStoryWrapper.svelte';

const meta = {
    component: ButtonGroupStoryWrapper,
    title: 'uikit/ButtonGroup',
    parameters: {
        docs: {
            description: {
                component: '여러 버튼을 그룹으로 묶어 일관된 간격으로 배치하는 컴포넌트',
            },
        },
    },
    argTypes: {
        scenario: {
            control: 'select',
            options: ['default', 'mixed', 'withDisabled'],
            description: '버튼 그룹 시나리오',
        },
    },
} satisfies Meta<typeof ButtonGroupStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { scenario: 'default' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.getAllByRole('button');
        await expect(buttons).toHaveLength(2);
    },
};

export const MixedVariants: Story = {
    args: { scenario: 'mixed' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.getAllByRole('button');
        await expect(buttons).toHaveLength(3);
        await expect(canvas.getByText('Primary')).toBeInTheDocument();
        await expect(canvas.getByText('Secondary')).toBeInTheDocument();
        await expect(canvas.getByText('Accent')).toBeInTheDocument();
    },
};

export const WithDisabled: Story = {
    args: { scenario: 'withDisabled' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.getAllByRole('button');
        await expect(buttons[0]).not.toBeDisabled();
        await expect(buttons[1]).toBeDisabled();
    },
};
