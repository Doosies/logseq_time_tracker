import { style } from '@vanilla-extract/css';

export const root = style({
    position: 'relative',
    width: '100%',
    maxWidth: '320px',
});

export const trigger = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left',
    ':focus-visible': {
        outline: '2px solid #3b82f6',
        outlineOffset: '2px',
    },
});

export const panel = style({
    position: 'absolute',
    zIndex: 50,
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    maxHeight: '280px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
});

export const search_input = style({
    width: '100%',
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.875rem',
});

export const breadcrumb_row = style({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: '#555',
});

export const crumb = style({
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: '#2563eb',
    textDecoration: 'underline',
    fontSize: 'inherit',
});

export const crumb_sep = style({
    color: '#999',
    userSelect: 'none',
});

export const listbox = style({
    flex: 1,
    overflowY: 'auto',
    minHeight: '120px',
    maxHeight: '200px',
    padding: 0,
    margin: 0,
    listStyle: 'none',
});

export const option = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    fontSize: '0.875rem',
    textAlign: 'left',
    cursor: 'pointer',
    ':hover': {
        backgroundColor: '#f3f4f6',
    },
});

export const option_highlighted = style({
    backgroundColor: '#e0e7ff',
});

export const option_folder_hint = style({
    fontSize: '0.75rem',
    color: '#6b7280',
});

export const empty_hint = style({
    fontSize: '0.8125rem',
    color: '#888',
    padding: '8px',
});
