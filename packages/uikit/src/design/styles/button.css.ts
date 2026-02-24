import { style, styleVariants } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

const base_button = style({
    display: 'inline-block',
    padding: '7px 10px',
    margin: '4px 0',
    border: 'none',
    borderRadius: theme_vars.radius.sm,
    cursor: 'pointer',
    fontWeight: theme_vars.font.weight.bold,
    transition: 'background-color 0.2s ease',
    textAlign: 'center',
    ':disabled': {
        backgroundColor: theme_vars.color.disabled,
        color: theme_vars.color.disabled_text,
        cursor: 'not-allowed',
    },
});

export const button_variant = styleVariants({
    primary: [
        base_button,
        {
            backgroundColor: theme_vars.color.primary,
            color: '#ffffff',
            ':hover:not(:disabled)': {
                backgroundColor: theme_vars.color.primary_hover,
            },
            ':active:not(:disabled)': {
                backgroundColor: theme_vars.color.primary_active,
            },
        },
    ],
    secondary: [
        base_button,
        {
            backgroundColor: theme_vars.color.secondary,
            color: '#ffffff',
            ':hover:not(:disabled)': {
                backgroundColor: theme_vars.color.secondary_hover,
            },
        },
    ],
    accent: [
        base_button,
        {
            backgroundColor: theme_vars.color.accent,
            color: '#ffffff',
            ':hover:not(:disabled)': {
                backgroundColor: theme_vars.color.accent_hover,
            },
            ':active:not(:disabled)': {
                backgroundColor: theme_vars.color.accent_active,
            },
        },
    ],
});

export const button_size = styleVariants({
    sm: {
        padding: '6px 4px',
        fontSize: theme_vars.font.size.sm,
    },
    md: {
        padding: '7px 10px',
        fontSize: theme_vars.font.size.md,
    },
});

export const button_full_width = style({
    width: '100%',
    display: 'block',
});
