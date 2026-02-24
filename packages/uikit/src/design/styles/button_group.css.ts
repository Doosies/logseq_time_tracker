import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const button_group_container = style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme_vars.space.sm,
    marginTop: theme_vars.space.md,
    clear: 'both',
});
