import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { checkA11y } from './check_a11y';
import ButtonA11yWrapper from './wrappers/ButtonA11yWrapper.svelte';
import TextInputA11yWrapper from './wrappers/TextInputA11yWrapper.svelte';
import SelectA11yWrapper from './wrappers/SelectA11yWrapper.svelte';
import TextareaA11yWrapper from './wrappers/TextareaA11yWrapper.svelte';
import CardA11yWrapper from './wrappers/CardA11yWrapper.svelte';
import PopoverA11yWrapper from './wrappers/PopoverA11yWrapper.svelte';
import ToastA11yWrapper from './wrappers/ToastA11yWrapper.svelte';
import ToggleInputA11yWrapper from './wrappers/ToggleInputA11yWrapper.svelte';
import ButtonGroupA11yWrapper from './wrappers/ButtonGroupA11yWrapper.svelte';
import CheckboxListA11yWrapper from './wrappers/CheckboxListA11yWrapper.svelte';
import SectionA11yWrapper from './wrappers/SectionA11yWrapper.svelte';
import DatePickerA11yWrapper from './wrappers/DatePickerA11yWrapper.svelte';
import DndA11yWrapper from './wrappers/DndA11yWrapper.svelte';
import ElapsedTimerA11yWrapper from './wrappers/ElapsedTimerA11yWrapper.svelte';
import LayoutSwitcherA11yWrapper from './wrappers/LayoutSwitcherA11yWrapper.svelte';
import PromptDialogA11yWrapper from './wrappers/PromptDialogA11yWrapper.svelte';
import TimeRangePickerA11yWrapper from './wrappers/TimeRangePickerA11yWrapper.svelte';
import TooltipA11yWrapper from './wrappers/TooltipA11yWrapper.svelte';

describe('접근성(a11y) 테스트', () => {
    describe('Button', () => {
        it('접근성 위반 없음', async () => {
            const { container } = render(ButtonA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('TextInput', () => {
        it('aria-label과 함께 접근성 위반 없음', async () => {
            const { container } = render(TextInputA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Select', () => {
        it('aria-label과 함께 접근성 위반 없음', async () => {
            const { container } = render(SelectA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Textarea', () => {
        it('aria-label과 함께 접근성 위반 없음', async () => {
            const { container } = render(TextareaA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Card', () => {
        it('시맨틱 HTML로 접근성 위반 없음', async () => {
            const { container } = render(CardA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Popover', () => {
        it('닫힌 상태 접근성 위반 없음', async () => {
            const { container } = render(PopoverA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });

        it('열린 상태 접근성 위반 없음', async () => {
            const { container, getByText } = render(PopoverA11yWrapper);
            const trigger = getByText('열기');
            await fireEvent.click(trigger);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Toast', () => {
        it('접근성 위반 없음', async () => {
            const { container } = render(ToastA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('ToggleInput', () => {
        it('복합 컨트롤 접근성 위반 없음', async () => {
            const { container } = render(ToggleInputA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('ButtonGroup', () => {
        it('role="group" 접근성 위반 없음', async () => {
            const { container } = render(ButtonGroupA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('CheckboxList', () => {
        it('드래그 핸들 포함 접근성 위반 없음', async () => {
            const { container } = render(CheckboxListA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Section', () => {
        it('시맨틱 section 요소 접근성 위반 없음', async () => {
            const { container } = render(SectionA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('DatePicker', () => {
        it('접근성 위반 없음', async () => {
            const { container } = render(DatePickerA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Dnd', () => {
        it('접근성 위반 없음', async () => {
            const { container } = render(DndA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('ElapsedTimer', () => {
        it('접근성 위반 없음', async () => {
            const { container } = render(ElapsedTimerA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('LayoutSwitcher', () => {
        it('접근성 위반 없음', async () => {
            const { container } = render(LayoutSwitcherA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('PromptDialog', () => {
        it('열린 상태 접근성 위반 없음', async () => {
            const { container } = render(PromptDialogA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('TimeRangePicker', () => {
        it('접근성 위반 없음', async () => {
            const { container } = render(TimeRangePickerA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Tooltip', () => {
        it('닫힌 상태 접근성 위반 없음', async () => {
            const { container } = render(TooltipA11yWrapper);
            const results = await checkA11y(container);
            expect(results).toHaveNoViolations();
        });

        it('열린 상태 접근성 위반 없음', async () => {
            const { container } = render(TooltipA11yWrapper);
            const wrapper_el = container.querySelector('.tooltip-wrapper');
            expect(wrapper_el).toBeTruthy();
            await fireEvent.mouseEnter(wrapper_el as HTMLElement);
            await waitFor(() => {
                expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy();
            });
            const results = await checkA11y(document.body, {
                rules: { region: { enabled: false } },
            });
            expect(results).toHaveNoViolations();
        });
    });
});
