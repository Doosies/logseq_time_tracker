import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import ButtonStoryWrapper from './ButtonStoryWrapper.svelte';

const meta = {
    component: ButtonStoryWrapper,
    title: 'uikit/Button',
    args: {
        onclick: fn(),
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'accent'],
            description: '버튼 스타일 변형',
        },
        size: {
            control: 'radio',
            options: ['sm', 'md'],
            description: '버튼 크기',
        },
        disabled: { control: 'boolean', description: '비활성화 상태' },
        fullWidth: { control: 'boolean', description: '전체 너비 사용' },
        label: { control: 'text', description: '버튼 텍스트' },
    },
} satisfies Meta<typeof ButtonStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: { variant: 'primary', label: 'Click me' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button')).toBeInTheDocument();
        await expect(canvas.getByText('Click me')).toBeInTheDocument();
    },
};

export const Secondary: Story = {
    args: { variant: 'secondary', label: 'Secondary' },
};

export const Accent: Story = {
    args: { variant: 'accent', label: 'Accent' },
};

export const Small: Story = {
    args: { size: 'sm', variant: 'primary', label: 'Small' },
};

export const Medium: Story = {
    args: { size: 'md', variant: 'primary', label: 'Medium' },
};

export const Disabled: Story = {
    args: { disabled: true, variant: 'primary', label: 'Disabled' },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await expect(button).toBeDisabled();
        await userEvent.click(button);
        await expect(args['onclick']).not.toHaveBeenCalled();
    },
};

export const FullWidth: Story = {
    args: { fullWidth: true, variant: 'primary', label: 'Full Width' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button')).toBeInTheDocument();
    },
};

export const WithClickHandler: Story = {
    args: { variant: 'primary', label: 'Click to test' },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await userEvent.click(button);
        await expect(args['onclick']).toHaveBeenCalledOnce();
    },
};
