import { createTheme } from '@vanilla-extract/css';
import { theme_vars } from './contract.css';

export const light_theme = createTheme(theme_vars, {
    color: {
        primary: '#4169e1',
        primary_hover: '#3557c7',
        primary_active: '#2a45a3',
        secondary: '#6c757d',
        secondary_hover: '#5a6268',
        accent: '#3250b9',
        accent_hover: '#2a4399',
        accent_active: '#1f3277',
        text: '#2c3e50',
        text_secondary: '#6c757d',
        background: '#ffffff',
        surface: '#f0f0f0',
        border: '#ccc',
        disabled: '#e9ecef',
        disabled_text: '#adb5bd',
        error: '#dc3545',
        success: '#28a745',
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
