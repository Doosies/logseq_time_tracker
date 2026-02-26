import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const toast_container = style({
    fontSize: theme_vars.font.size.sm,
    color: theme_vars.color.error,
    fontWeight: theme_vars.font.weight.medium,
    overflowWrap: 'break-word',
    marginTop: theme_vars.space.xs,
});
