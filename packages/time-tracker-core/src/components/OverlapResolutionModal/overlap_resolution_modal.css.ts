import { style } from '@vanilla-extract/css';

export const overlay = style({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
});

export const modal = style({
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
});

export const modal_title = style({
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '8px',
});

export const modal_description = style({
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: 1.5,
});

export const timeline_wrap = style({
    marginBottom: '20px',
});

export const timeline_label = style({
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: '8px',
});

export const timeline_track = style({
    position: 'relative',
    height: '36px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
});

export const segment = style({
    position: 'absolute',
    top: '4px',
    height: '28px',
    borderRadius: '4px',
    minWidth: '2px',
    boxSizing: 'border-box',
});

export const segment_existing = style([
    segment,
    {
        backgroundColor: '#9ca3af',
        opacity: 0.85,
        zIndex: 1,
    },
]);

export const segment_new = style([
    segment,
    {
        backgroundColor: '#3b82f6',
        opacity: 0.75,
        zIndex: 2,
    },
]);

export const segment_overlap = style([
    segment,
    {
        backgroundColor: '#ef4444',
        opacity: 0.9,
        zIndex: 3,
        border: '1px solid #b91c1c',
    },
]);

export const legend = style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '10px',
    fontSize: '0.75rem',
    color: '#4b5563',
});

export const legend_item = style({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
});

export const legend_swatch = style({
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    flexShrink: 0,
});

export const button_row = style({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '8px',
});

export const button_primary = style({
    padding: '8px 14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
});

export const button_secondary = style({
    padding: '8px 14px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontSize: '0.875rem',
});

export const button_cancel = style({
    padding: '8px 14px',
    backgroundColor: 'white',
    color: '#6b7280',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontSize: '0.875rem',
});
