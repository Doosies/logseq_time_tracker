import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const elapsed_timer_display = style({
    fontSize: '2rem',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'monospace',
    color: theme_vars.color.text,
    lineHeight: 1.2,
});
