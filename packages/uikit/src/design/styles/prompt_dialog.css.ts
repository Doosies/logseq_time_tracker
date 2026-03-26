import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const overlay = style({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme_vars.z_index.popover,
});

export const modal = style({
    backgroundColor: theme_vars.color.background,
    borderRadius: theme_vars.radius.md,
    padding: `calc(${theme_vars.space.lg} + ${theme_vars.space.md})`,
    width: '100%',
    maxWidth: '400px',
    boxShadow: theme_vars.shadow.lg,
});

export const modal_title = style({
    fontSize: theme_vars.font.size.lg,
    fontWeight: theme_vars.font.weight.bold,
    marginBottom: theme_vars.space.md,
    color: theme_vars.color.text,
});

export const modal_description = style({
    fontSize: theme_vars.font.size.sm,
    color: theme_vars.color.text_secondary,
    marginBottom: theme_vars.space.lg,
});

export const textarea = style({
    width: '100%',
    minHeight: '80px',
    padding: theme_vars.space.md,
    borderRadius: theme_vars.radius.sm,
    border: `1px solid ${theme_vars.color.border}`,
    resize: 'vertical',
    fontSize: theme_vars.font.size.sm,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    backgroundColor: theme_vars.color.background,
    color: theme_vars.color.text,
    ':focus': {
        outline: 'none',
        borderColor: theme_vars.color.primary,
        boxShadow: `0 0 0 2px color-mix(in srgb, ${theme_vars.color.primary} 30%, transparent)`,
    },
});

export const char_count = style({
    fontSize: theme_vars.font.size.xs,
    color: theme_vars.color.disabled_text,
    textAlign: 'right',
    marginTop: theme_vars.space.sm,
});

export const button_row = style({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme_vars.space.md,
    marginTop: theme_vars.space.lg,
});

export const button_confirm = style({
    padding: `${theme_vars.space.md} ${theme_vars.space.lg}`,
    backgroundColor: theme_vars.color.primary,
    color: theme_vars.color.background,
    borderRadius: theme_vars.radius.sm,
    border: 'none',
    cursor: 'pointer',
    fontSize: theme_vars.font.size.sm,
    fontWeight: theme_vars.font.weight.medium,
    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
});

export const button_cancel = style({
    padding: `${theme_vars.space.md} ${theme_vars.space.lg}`,
    backgroundColor: theme_vars.color.surface,
    color: theme_vars.color.text,
    borderRadius: theme_vars.radius.sm,
    border: `1px solid ${theme_vars.color.border}`,
    cursor: 'pointer',
    fontSize: theme_vars.font.size.sm,
});
