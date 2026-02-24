/// <reference types="vite/client" />
/// <reference types="svelte" />

declare module '*.svelte' {
    import type { Component } from 'svelte';
    const component: Component;
    export default component;
}

interface ImportMetaEnv {
    readonly VITE_LOGIN_ACCOUNTS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
