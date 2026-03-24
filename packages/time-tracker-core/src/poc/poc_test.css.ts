import { style } from '@vanilla-extract/css';

export const poc_container = style({
    padding: '24px',
    backgroundColor: '#f0f4ff',
    borderRadius: '8px',
    border: '2px solid #4f46e5',
    fontFamily: 'system-ui, sans-serif',
});

export const poc_title = style({
    fontSize: '18px',
    fontWeight: 700,
    color: '#4f46e5',
    marginBottom: '8px',
});

export const poc_status = style({
    fontSize: '14px',
    color: '#059669',
    padding: '8px 12px',
    backgroundColor: '#ecfdf5',
    borderRadius: '4px',
    display: 'inline-block',
});
