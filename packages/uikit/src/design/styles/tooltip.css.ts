import { keyframes, style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

const tooltip_fade_in = keyframes({
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
});

export const tooltip_container = style({
    position: 'fixed',
    zIndex: 9999,
    animation: `${tooltip_fade_in} ${theme_vars.transition.fast} ease forwards`,
});

export const tooltip_content = style({
    position: 'relative',
    padding: `${theme_vars.space.xs} ${theme_vars.space.sm}`,
    backgroundColor: theme_vars.color.surface,
    color: theme_vars.color.text,
    border: `1px solid ${theme_vars.color.border}`,
    borderRadius: theme_vars.radius.sm,
    boxShadow: theme_vars.shadow.sm,
    fontSize: theme_vars.font.size.xs,
    fontWeight: theme_vars.font.weight.normal,
    maxWidth: '200px',
    whiteSpace: 'normal',
    selectors: {
        '&[data-position="top"]::after': {
            content: '',
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '5px solid transparent',
            borderTopColor: theme_vars.color.surface,
            borderBottomWidth: 0,
        },
        '&[data-position="bottom"]::after': {
            content: '',
            position: 'absolute',
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '5px solid transparent',
            borderBottomColor: theme_vars.color.surface,
            borderTopWidth: 0,
        },
        '&[data-position="left"]::after': {
            content: '',
            position: 'absolute',
            right: '-5px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: '5px solid transparent',
            borderLeftColor: theme_vars.color.surface,
            borderRightWidth: 0,
        },
        '&[data-position="right"]::after': {
            content: '',
            position: 'absolute',
            left: '-5px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: '5px solid transparent',
            borderRightColor: theme_vars.color.surface,
            borderLeftWidth: 0,
        },
    },
});
