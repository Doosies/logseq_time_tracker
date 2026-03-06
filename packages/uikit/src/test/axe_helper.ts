import type { AxeResults } from 'axe-core';
import { expect } from 'vitest';

declare module 'vitest' {
    interface Assertion {
        toHaveNoViolations(): void;
    }
    interface AsymmetricMatchersContaining {
        toHaveNoViolations(): void;
    }
}

function formatViolations(violations: AxeResults['violations']): string {
    if (violations.length === 0) return '';
    return violations
        .map((violation) => {
            const nodes = violation.nodes.map((node) => `  - ${node.html}`).join('\n');
            return `[${violation.impact}] ${violation.id}: ${violation.description}\n${nodes}`;
        })
        .join('\n\n');
}

expect.extend({
    toHaveNoViolations(received: AxeResults) {
        const { violations } = received;
        const pass = violations.length === 0;
        return {
            pass,
            message: () =>
                pass
                    ? 'Expected accessibility violations but found none'
                    : `Found ${violations.length} accessibility violation(s):\n\n${formatViolations(violations)}`,
            actual: violations,
            expected: [],
        };
    },
});
