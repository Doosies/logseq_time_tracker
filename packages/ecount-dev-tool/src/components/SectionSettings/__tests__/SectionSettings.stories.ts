import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, within, userEvent } from 'storybook/test';
import SectionSettingsStoryWrapper from './SectionSettingsStoryWrapper.svelte';

const meta = {
    component: SectionSettingsStoryWrapper,
    title: 'ecount-dev-tool/SectionSettings',
    parameters: {
        docs: {
            description: {
                component: '섹션 순서 변경 및 표시/숨기기 설정 팝오버',
            },
        },
    },
    argTypes: {
        sections: { control: 'object', description: '섹션 목록 (id, label)' },
    },
} satisfies Meta<typeof SectionSettingsStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByLabelText('섹션 설정');
        await userEvent.click(trigger);

        const panel = canvas.getByText('섹션 설정');
        await expect(panel).toBeInTheDocument();

        await expect(canvas.getByText('빠른 로그인')).toBeInTheDocument();
        await expect(canvas.getByText('서버 관리')).toBeInTheDocument();
        await expect(canvas.getByText('액션 바')).toBeInTheDocument();
    },
};

export const WithHiddenSection: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByLabelText('섹션 설정');
        await userEvent.click(trigger);

        const checkboxes = canvas.getAllByRole('checkbox');
        await expect(checkboxes.length).toBe(3);

        await userEvent.click(checkboxes[0]!);

        await expect(checkboxes[0]).not.toBeChecked();
        await expect(checkboxes[1]).toBeChecked();
        await expect(checkboxes[2]).toBeChecked();
    },
};
