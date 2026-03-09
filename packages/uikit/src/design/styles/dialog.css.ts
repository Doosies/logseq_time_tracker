import { style, keyframes } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

const fade_in = keyframes({
    from: { opacity: 0 },
    to: { opacity: 1 },
});

export const dialog_overlay = style({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    animation: `${fade_in} ${theme_vars.transition.normal} forwards`,
});

export const dialog_content = style({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme_vars.color.surface,
    borderRadius: theme_vars.radius.md,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    zIndex: 1001,
    padding: theme_vars.space.lg,
    animation: `${fade_in} ${theme_vars.transition.normal} forwards`,
    // For absolute-positioned close button inside
    isolation: 'isolate',
});

export const dialog_title = style({
    fontSize: theme_vars.font.size.lg,
    fontWeight: theme_vars.font.weight.bold,
    marginBottom: theme_vars.space.md,
});

export const dialog_description = style({
    fontSize: theme_vars.font.size.sm,
    color: theme_vars.color.text_secondary,
    marginBottom: theme_vars.space.md,
});

export const dialog_close = style({
    position: 'absolute',
    top: theme_vars.space.md,
    right: theme_vars.space.md,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: theme_vars.space.xs,
    borderRadius: theme_vars.radius.sm,
    color: theme_vars.color.text_secondary,
    transition: `color ${theme_vars.transition.normal}, background-color ${theme_vars.transition.normal}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    selectors: {
        '&:hover': {
            color: theme_vars.color.text,
            backgroundColor: theme_vars.color.background,
        },
    },
});
