import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const popover_trigger = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme_vars.color.text_secondary,
    padding: theme_vars.space.xs,
    borderRadius: theme_vars.radius.sm,
    transition: 'color 0.15s ease, background-color 0.15s ease',
    opacity: '0.6',
    selectors: {
        '&:hover': {
            color: theme_vars.color.text,
            backgroundColor: theme_vars.color.surface,
            opacity: '1',
        },
        '&:active': {
            transform: 'scale(0.9)',
            opacity: '0.8',
        },
    },
});

export const popover_content = style({
    position: 'absolute',
    top: '100%',
    right: '0',
    zIndex: 10,
    minWidth: '200px',
    backgroundColor: theme_vars.color.background,
    border: `1px solid ${theme_vars.color.border}`,
    borderRadius: theme_vars.radius.md,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
});
