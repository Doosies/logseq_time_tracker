import { style } from '@vanilla-extract/css';
import { theme_vars } from './theme.css';

export const container = style({
    padding: theme_vars.space.large,
    fontFamily: theme_vars.font.family.base,
    maxWidth: '400px',
    margin: '0 auto',
});

export const title = style({
    fontSize: theme_vars.font.size.large,
    marginBottom: theme_vars.space.large,
    textAlign: 'center',
    color: theme_vars.color.text,
    fontWeight: theme_vars.font.weight.bold,
});

export const counter_section = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme_vars.space.medium,
});

export const count_text = style({
    fontSize: theme_vars.font.size.xlarge,
    fontWeight: theme_vars.font.weight.bold,
    margin: '0',
    color: theme_vars.color.text,
});

export const button_group = style({
    display: 'flex',
    gap: theme_vars.space.small,
});

export const button = style({
    padding: `${theme_vars.space.small} ${theme_vars.space.large}`,
    fontSize: theme_vars.font.size.medium,
    cursor: 'pointer',
    backgroundColor: theme_vars.color.primary,
    color: 'white',
    border: 'none',
    borderRadius: theme_vars.radius.medium,
    transition: 'all 0.2s ease',
    fontWeight: theme_vars.font.weight.medium,

    ':hover': {
        backgroundColor: theme_vars.color.primary_hover,
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },

    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },

    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
    },
});
