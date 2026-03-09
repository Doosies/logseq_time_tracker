import type { Component } from 'svelte';

export type SectionId = 'quick-login' | 'server-manager' | 'action-bar' | 'user-script';

export interface SectionDefinition {
    id: SectionId;
    label: string;
    component: Component;
}
