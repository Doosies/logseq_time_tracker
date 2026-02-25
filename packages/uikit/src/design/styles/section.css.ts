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

export const section_content = style({
    color: theme_vars.color.text,
});
