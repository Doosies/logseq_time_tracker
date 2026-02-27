import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const checkbox_list_container = style({
    padding: `${theme_vars.space.xs} 0`,
});

export const checkbox_list_item = style({
    display: 'flex',
    alignItems: 'center',
    gap: theme_vars.space.sm,
    padding: `${theme_vars.space.sm} ${theme_vars.space.md}`,
    transition: `background-color ${theme_vars.transition.fast}`,
    outline: 'none',
    selectors: {
        '&:hover': {
            backgroundColor: theme_vars.color.surface,
        },
        '&:focus-visible': {
            backgroundColor: theme_vars.color.surface,
            boxShadow: `inset 0 0 0 2px ${theme_vars.color.primary}`,
        },
    },
});

export const checkbox_list_item_disabled = style({
    opacity: 0.5,
    selectors: {
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
});

export const checkbox_list_label = style({
    fontSize: theme_vars.font.size.sm,
    color: theme_vars.color.text,
    userSelect: 'none',
});
