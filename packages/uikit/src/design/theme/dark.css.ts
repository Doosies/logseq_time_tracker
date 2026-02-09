import { createTheme } from '@vanilla-extract/css';
import { theme_vars } from './contract.css';

export const dark_theme = createTheme(theme_vars, {
    color: {
        primary: '#5a7bd6',
        primary_hover: '#4a6bb8',
        primary_active: '#3a5a9a',
        secondary: '#adb5bd',
        secondary_hover: '#9da5ae',
        accent: '#4166d5',
        accent_hover: '#3556b7',
        accent_active: '#294699',
        text: '#f8f9fa',
        text_secondary: '#adb5bd',
        background: '#212529',
        surface: '#2c3136',
        border: '#495057',
        disabled: '#343a40',
        disabled_text: '#6c757d',
        error: '#e74c3c',
        success: '#2ecc71',
    },
    space: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
    },
    font: {
        size: {
            xs: '11px',
            sm: '12px',
            md: '14px',
            lg: '16px',
        },
        weight: {
            normal: '400',
            medium: '500',
            bold: '700',
        },
        family: {
            base: 'Arial, sans-serif',
        },
    },
    radius: {
        sm: '4px',
        md: '5px',
    },
});
