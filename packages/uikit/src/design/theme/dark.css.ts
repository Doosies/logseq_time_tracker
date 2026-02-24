import { createTheme } from '@vanilla-extract/css';
import { theme_vars } from './contract.css';

export const dark_theme = createTheme(theme_vars, {
    color: {
        primary: '#2563eb',
        primary_hover: '#1d4ed8',
        primary_active: '#1e40af',
        secondary: '#64748b',
        secondary_hover: '#475569',
        accent: '#0f766e',
        accent_hover: '#115e59',
        accent_active: '#134e4a',
        text: '#f1f5f9',
        text_secondary: '#94a3b8',
        background: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        disabled: '#1e293b',
        disabled_text: '#475569',
        error: '#ef4444',
        success: '#22c55e',
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
