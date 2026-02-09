import { globalStyle } from '@vanilla-extract/css';
import { theme_vars } from './theme/contract.css';

globalStyle('*, *::before, *::after', {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
});

globalStyle('html, body', {
    fontFamily: theme_vars.font.family.base,
    fontSize: theme_vars.font.size.md,
    color: theme_vars.color.text,
    backgroundColor: theme_vars.color.background,
    lineHeight: 1.5,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
});

globalStyle('button', {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    cursor: 'pointer',
});

globalStyle('input, textarea, select', {
    fontFamily: 'inherit',
    fontSize: 'inherit',
});
