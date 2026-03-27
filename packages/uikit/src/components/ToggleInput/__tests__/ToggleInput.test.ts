import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import ToggleInputTestWrapper from './ToggleInput.test.svelte';

describe('ToggleInput', () => {
    it('기본 렌더링 — 접두사와 콤보박스가 보인다', () => {
        render(ToggleInputTestWrapper, { initial_text_mode: false });
        expect(screen.getByText('접두사')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('토글 클릭 시 텍스트 입력 모드로 전환된다', async () => {
        const user = userEvent.setup();
        render(ToggleInputTestWrapper, { initial_text_mode: false });

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Toggle input mode' }));

        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('Prefix에 전달한 텍스트가 렌더링된다', () => {
        render(ToggleInputTestWrapper, {
            prefix_text: '라벨:',
            initial_text_mode: false,
        });
        expect(screen.getByText('라벨:')).toBeInTheDocument();
    });

    it('disabled일 때 Select가 비활성화된다', () => {
        render(ToggleInputTestWrapper, {
            initial_text_mode: false,
            disabled: true,
        });
        expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('disabled일 때 텍스트 모드에서 TextInput이 비활성화된다', async () => {
        const user = userEvent.setup();
        render(ToggleInputTestWrapper, {
            initial_text_mode: true,
            disabled: true,
        });

        expect(screen.getByRole('textbox')).toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'Toggle input mode' }));

        expect(screen.getByRole('combobox')).toBeDisabled();
    });
});
