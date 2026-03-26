import { style, globalStyle } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const toast_container = style({
    position: 'fixed',
    bottom: theme_vars.space.md,
    right: theme_vars.space.md,
    display: 'flex',
    flexDirection: 'column',
    gap: theme_vars.space.sm,
    zIndex: theme_vars.z_index.popover,
    maxWidth: '360px',
});

export const toast_item = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme_vars.space.sm} ${theme_vars.space.md}`,
    borderRadius: theme_vars.radius.md,
    boxShadow: theme_vars.shadow.md,
    fontSize: theme_vars.font.size.sm,
    fontWeight: theme_vars.font.weight.medium,
    color: theme_vars.color.background,
    overflowWrap: 'break-word',
});

globalStyle(`${toast_item}[data-level="info"]`, {
    backgroundColor: theme_vars.color.primary,
});

globalStyle(`${toast_item}[data-level="success"]`, {
    backgroundColor: theme_vars.color.success,
});

globalStyle(`${toast_item}[data-level="warning"]`, {
    backgroundColor: theme_vars.color.accent,
});

globalStyle(`${toast_item}[data-level="error"]`, {
    backgroundColor: theme_vars.color.error,
});
