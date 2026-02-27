import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const card_container = style({
    borderRadius: theme_vars.radius.md,
    backgroundColor: theme_vars.color.background,
    padding: theme_vars.space.lg,
    boxShadow: theme_vars.shadow.sm,
    width: '360px',
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
});
