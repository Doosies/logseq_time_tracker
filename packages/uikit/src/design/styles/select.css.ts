import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const select_container = style({
    display: 'flex',
    flex: 1,
    minWidth: 0,
});

export const select_element = style({
    width: '100%',
    padding: `${theme_vars.space.sm} 6px`,
    border: `1px solid ${theme_vars.color.border}`,
    borderRadius: theme_vars.radius.sm,
    boxSizing: 'border-box',
    backgroundColor: theme_vars.color.background,
    color: theme_vars.color.text,
    fontSize: theme_vars.font.size.sm,
    cursor: 'pointer',
    height: '28px',
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
