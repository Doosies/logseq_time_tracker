import { globalStyle } from '@vanilla-extract/css';
import { theme_vars } from './theme.css';

// 글로벌 리셋 및 기본 스타일
globalStyle('*, *::before, *::after', {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
});

globalStyle('html, body', {
    fontFamily: theme_vars.font.family.base,
    fontSize: theme_vars.font.size.medium,
    color: theme_vars.color.text,
    backgroundColor: theme_vars.color.background,
    lineHeight: 1.5,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
});

globalStyle('button', {
    fontFamily: 'inherit',
    fontSize: 'inherit',
});

globalStyle('input, textarea, select', {
    fontFamily: 'inherit',
    fontSize: 'inherit',
});
