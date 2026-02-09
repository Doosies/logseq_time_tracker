import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const section_container = style({
    marginBottom: theme_vars.space.md,
});

export const section_title = style({
    fontWeight: theme_vars.font.weight.bold,
    fontSize: theme_vars.font.size.md,
    marginBottom: theme_vars.space.sm,
    color: theme_vars.color.text,
});

export const section_content = style({
    color: theme_vars.color.text,
});
