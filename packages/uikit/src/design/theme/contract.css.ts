import { createThemeContract } from '@vanilla-extract/css';

export const theme_vars = createThemeContract({
    color: {
        primary: null,
        primary_hover: null,
        primary_active: null,
        secondary: null,
        secondary_hover: null,
        accent: null,
        accent_hover: null,
        accent_active: null,
        text: null,
        text_secondary: null,
        background: null,
        surface: null,
        border: null,
        disabled: null,
        disabled_text: null,
        error: null,
        success: null,
    },
    space: {
        xs: null,
        sm: null,
        md: null,
        lg: null,
    },
    font: {
        size: {
            xs: null,
            sm: null,
            md: null,
            lg: null,
        },
        weight: {
            normal: null,
            medium: null,
            bold: null,
        },
        family: {
            base: null,
        },
    },
    radius: {
        sm: null,
        md: null,
    },
});
