import { createTheme, createThemeContract } from '@vanilla-extract/css';

// 테마 변수 계약 정의
export const theme_vars = createThemeContract({
    color: {
        primary: null,
        primary_hover: null,
        text: null,
        text_secondary: null,
        background: null,
        border: null,
    },
    space: {
        small: null,
        medium: null,
        large: null,
    },
    font: {
        size: {
            small: null,
            medium: null,
            large: null,
            xlarge: null,
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
        small: null,
        medium: null,
    },
});

// 라이트 테마
export const light_theme = createTheme(theme_vars, {
    color: {
        primary: '#007bff',
        primary_hover: '#0056b3',
        text: '#2c3e50',
        text_secondary: '#6c757d',
        background: '#ffffff',
        border: '#dee2e6',
    },
    space: {
        small: '10px',
        medium: '15px',
        large: '20px',
    },
    font: {
        size: {
            small: '14px',
            medium: '16px',
            large: '24px',
            xlarge: '32px',
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
        small: '4px',
        medium: '5px',
    },
});

// 다크 테마
export const dark_theme = createTheme(theme_vars, {
    color: {
        primary: '#0d6efd',
        primary_hover: '#0a58ca',
        text: '#f8f9fa',
        text_secondary: '#adb5bd',
        background: '#212529',
        border: '#495057',
    },
    space: {
        small: '10px',
        medium: '15px',
        large: '20px',
    },
    font: {
        size: {
            small: '14px',
            medium: '16px',
            large: '24px',
            xlarge: '32px',
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
        small: '4px',
        medium: '5px',
    },
});
