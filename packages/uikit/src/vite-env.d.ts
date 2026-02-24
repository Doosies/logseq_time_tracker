/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
/// <reference types="svelte" />

declare module '*.svelte' {
    import type { Component } from 'svelte';
    const component: Component;
    export default component;
}
