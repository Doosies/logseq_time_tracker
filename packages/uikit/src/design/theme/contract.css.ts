import { createGlobalThemeContract } from '@vanilla-extract/css';

export const theme_vars = createGlobalThemeContract({
    color: {
        primary: 'color-primary',
        primary_hover: 'color-primary-hover',
        primary_active: 'color-primary-active',
        secondary: 'color-secondary',
        secondary_hover: 'color-secondary-hover',
        secondary_active: 'color-secondary-active',
        accent: 'color-accent',
        accent_hover: 'color-accent-hover',
        accent_active: 'color-accent-active',
        text: 'color-text',
        text_secondary: 'color-text-secondary',
        background: 'color-background',
        surface: 'color-surface',
        border: 'color-border',
        disabled: 'color-disabled',
        disabled_text: 'color-disabled-text',
        error: 'color-error',
        success: 'color-success',
    },
    space: {
        xs: 'space-xs',
        sm: 'space-sm',
        md: 'space-md',
        lg: 'space-lg',
    },
    font: {
        size: {
            xs: 'font-size-xs',
            sm: 'font-size-sm',
            md: 'font-size-md',
            lg: 'font-size-lg',
        },
        weight: {
            normal: 'font-weight-normal',
            medium: 'font-weight-medium',
            bold: 'font-weight-bold',
        },
        family: {
            base: 'font-family-base',
        },
    },
    radius: {
        sm: 'radius-sm',
        md: 'radius-md',
    },
    transition: {
        fast: 'transition-fast',
        normal: 'transition-normal',
        slow: 'transition-slow',
    },
    z_index: {
        base: 'z-index-base',
        above: 'z-index-above',
        popover: 'z-index-popover',
    },
    shadow: {
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
    },
});
