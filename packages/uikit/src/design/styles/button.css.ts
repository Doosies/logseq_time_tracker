import { style, styleVariants } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

const base_button = style({
    display: 'inline-block',
    padding: '7px 10px',
    margin: `${theme_vars.space.sm} 0`,
    border: 'none',
    borderRadius: theme_vars.radius.sm,
    cursor: 'pointer',
    fontWeight: theme_vars.font.weight.bold,
    transition: `filter ${theme_vars.transition.normal}, box-shadow ${theme_vars.transition.normal}, transform ${theme_vars.transition.fast}`,
    textAlign: 'center',
    selectors: {
        '&:hover:not(:disabled)': {
            filter: 'brightness(1.2)',
            boxShadow: theme_vars.shadow.sm,
        },
        '&:active:not(:disabled)': {
            filter: 'brightness(0.85)',
            transform: 'scale(0.97)',
            boxShadow: 'none',
        },
    },
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
        },
    ],
    secondary: [
        base_button,
        {
            backgroundColor: theme_vars.color.secondary,
            color: '#ffffff',
        },
    ],
    accent: [
        base_button,
        {
            backgroundColor: theme_vars.color.accent,
            color: '#ffffff',
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
