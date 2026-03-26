export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
export type ButtonSize = 'sm' | 'md';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export type LayoutMode = 'compact' | 'full';

export type ToastLevel = 'info' | 'success' | 'warning' | 'error';

export interface SelectOption {
    value: string;
    label: string;
}
