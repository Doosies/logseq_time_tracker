import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import CheckboxListTestWrapper from './CheckboxList.test.svelte';

describe('CheckboxList', () => {
    it('아이템 라벨이 렌더링된다', () => {
        render(CheckboxListTestWrapper);
        expect(screen.getByText('옵션 A')).toBeInTheDocument();
        expect(screen.getByText('옵션 B')).toBeInTheDocument();
    });

    it('체크박스 초기 checked 상태가 item.visible과 일치한다', () => {
        render(CheckboxListTestWrapper);
        expect(screen.getByRole('checkbox', { name: '옵션 A' })).not.toBeChecked();
        expect(screen.getByRole('checkbox', { name: '옵션 B' })).toBeChecked();
    });

    it('체크박스 클릭 시 checked 상태가 바뀐다', async () => {
        const user = userEvent.setup();
        render(CheckboxListTestWrapper);

        const cb_a = screen.getByRole('checkbox', { name: '옵션 A' });
        await user.click(cb_a);
        expect(cb_a).toBeChecked();
    });
});
