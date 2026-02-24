import { createTheme } from '@vanilla-extract/css';
import { theme_vars } from './contract.css';

export const light_theme = createTheme(theme_vars, {
    color: {
        primary: '#1e3a5f',
        primary_hover: '#162d4a',
        primary_active: '#0f2035',
        secondary: '#3d4f5f',
        secondary_hover: '#2d3d4d',
        accent: '#2b6777',
        accent_hover: '#1f4f5e',
        accent_active: '#153845',
        text: '#1a2332',
        text_secondary: '#4a5568',
        background: '#ffffff',
        surface: '#f5f7fa',
        border: '#d1d9e0',
        disabled: '#edf0f4',
        disabled_text: '#9ba8b5',
        error: '#b91c1c',
        success: '#15803d',
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
