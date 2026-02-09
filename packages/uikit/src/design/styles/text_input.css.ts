import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const text_input_container = style({
    display: 'inline-block',
});

export const text_input_element = style({
    padding: '5px 6px',
    margin: '4px 0',
    border: `1px solid ${theme_vars.color.border}`,
    borderRadius: theme_vars.radius.sm,
    boxSizing: 'border-box',
    backgroundColor: theme_vars.color.background,
    color: theme_vars.color.text,
    fontSize: theme_vars.font.size.md,
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
