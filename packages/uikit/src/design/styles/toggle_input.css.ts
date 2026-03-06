import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const toggle_input_container = style({
    display: 'flex',
    alignItems: 'center',
    gap: theme_vars.space.xs,
    height: '28px',
    flex: 1,
    minWidth: 0,
});

export const toggle_icon = style({
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    border: `1px solid ${theme_vars.color.border}`,
    borderRadius: theme_vars.radius.sm,
    backgroundColor: theme_vars.color.background,
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    color: theme_vars.color.text_secondary,
    transition: `color ${theme_vars.transition.normal}, border-color ${theme_vars.transition.normal}, transform ${theme_vars.transition.fast}`,
    ':hover': {
        color: theme_vars.color.primary,
        borderColor: theme_vars.color.primary,
        transform: 'scale(1.05)',
    },
    ':active': {
        transform: 'scale(0.95)',
    },
});

export const prefix_container = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    border: `1px solid ${theme_vars.color.border}`,
    borderRadius: theme_vars.radius.sm,
    boxSizing: 'border-box',
    minWidth: '50px',
    height: '28px',
    textAlign: 'center',
    fontSize: theme_vars.font.size.sm,
    backgroundColor: theme_vars.color.background,
    whiteSpace: 'nowrap',
});
