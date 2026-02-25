import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const card_container = style({
    borderRadius: theme_vars.radius.md,
    backgroundColor: theme_vars.color.background,
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    width: '360px',
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
});
