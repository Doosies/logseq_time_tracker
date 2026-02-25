import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const card_container = style({
    borderRadius: theme_vars.radius.md,
    backgroundColor: theme_vars.color.background,
    padding: '16px',
    width: '380px',
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
});
