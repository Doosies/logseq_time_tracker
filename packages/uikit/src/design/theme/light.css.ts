import { createTheme } from '@vanilla-extract/css';
import { theme_vars } from './contract.css';

export const light_theme = createTheme(theme_vars, {
    color: {
        primary: '#2563eb',
        primary_hover: '#1d4ed8',
        primary_active: '#1e40af',
        secondary: '#475569',
        secondary_hover: '#334155',
        secondary_active: '#1e293b',
        accent: '#0f766e',
        accent_hover: '#115e59',
        accent_active: '#134e4a',
        text: '#0f172a',
        text_secondary: '#64748b',
        background: '#ffffff',
        surface: '#f8fafc',
        border: '#e2e8f0',
        disabled: '#f1f5f9',
        disabled_text: '#94a3b8',
        error: '#dc2626',
        success: '#16a34a',
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
            base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
    },
    radius: {
        sm: '6px',
        md: '8px',
    },
    transition: {
        fast: '0.1s ease',
        normal: '0.15s ease',
        slow: '0.3s ease',
    },
    z_index: {
        base: '1',
        above: '2',
        popover: '10',
    },
    shadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
        md: '0 4px 12px rgba(0, 0, 0, 0.12)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.16)',
    },
});
