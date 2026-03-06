import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { checkA11y } from './check_a11y';
import ButtonA11yWrapper from './wrappers/ButtonA11yWrapper.svelte';
import TextInputA11yWrapper from './wrappers/TextInputA11yWrapper.svelte';
import SelectA11yWrapper from './wrappers/SelectA11yWrapper.svelte';
import TextareaA11yWrapper from './wrappers/TextareaA11yWrapper.svelte';

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
});
