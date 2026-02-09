import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const card_container = style({
    borderRadius: theme_vars.radius.md,
    backgroundColor: theme_vars.color.surface,
    padding: '20px',
    width: '230px',
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});
