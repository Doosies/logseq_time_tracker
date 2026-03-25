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
    gap: '8px',
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

export const option_title = style({
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

export const badge = style({
    flexShrink: 0,
    fontSize: '0.6875rem',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 600,
    textTransform: 'uppercase',
});

export const badge_pending = style([badge, { backgroundColor: '#e5e7eb', color: '#374151' }]);
export const badge_in_progress = style([badge, { backgroundColor: '#dbeafe', color: '#1d4ed8' }]);
export const badge_paused = style([badge, { backgroundColor: '#ffedd5', color: '#c2410c' }]);
export const badge_completed = style([badge, { backgroundColor: '#d1fae5', color: '#047857' }]);
export const badge_cancelled = style([badge, { backgroundColor: '#fee2e2', color: '#b91c1c' }]);

export const empty_hint = style({
    fontSize: '0.8125rem',
    color: '#888',
    padding: '8px',
});
