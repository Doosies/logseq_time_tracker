import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const button_group_container = style({
    display: 'flex',
    gap: theme_vars.space.sm,
    marginTop: theme_vars.space.md,
    justifyContent: 'space-between',
    clear: 'both',
});
