import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const select_container = style({
    display: 'inline-block',
});

export const select_element = style({
    padding: '4px',
    border: `1px solid ${theme_vars.color.border}`,
    borderRadius: theme_vars.radius.sm,
    boxSizing: 'border-box',
    backgroundColor: theme_vars.color.background,
    color: theme_vars.color.text,
    fontSize: theme_vars.font.size.md,
    cursor: 'pointer',
    ':focus': {
        outline: `2px solid ${theme_vars.color.primary}`,
        outlineOffset: '1px',
    },
    ':disabled': {
        backgroundColor: theme_vars.color.disabled,
        color: theme_vars.color.disabled_text,
        cursor: 'not-allowed',
    },
});
