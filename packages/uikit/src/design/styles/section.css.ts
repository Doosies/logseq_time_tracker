import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const section_container = style({
    marginBottom: theme_vars.space.md,
});

export const section_title = style({
    fontWeight: theme_vars.font.weight.bold,
    fontSize: theme_vars.font.size.lg,
    marginBottom: theme_vars.space.md,
    color: theme_vars.color.text,
    borderLeft: `3px solid ${theme_vars.color.primary}`,
    paddingLeft: theme_vars.space.sm,
});

export const section_title_collapsible = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: 0,
    paddingLeft: theme_vars.space.sm,
    cursor: 'pointer',
    userSelect: 'none',
    ':hover': {
        opacity: 0.8,
    },
});

export const section_chevron = style({
    fontSize: theme_vars.font.size.xs,
    color: theme_vars.color.text_secondary,
    transition: 'transform 0.2s ease',
});

export const section_chevron_collapsed = style({
    transform: 'rotate(-90deg)',
});

export const section_content = style({
    color: theme_vars.color.text,
});

export const section_content_collapsed = style({
    display: 'none',
});
