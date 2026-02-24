import { describe, it, vi, beforeEach } from 'vitest';
import { composeStories } from '@storybook/svelte-vite';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import type { Component } from 'svelte';

type StoryModule = Parameters<typeof composeStories>[0];

interface ComposedStory {
    Component: Component;
    props: Record<string, unknown>;
    play?: (context: { canvasElement: HTMLElement }) => Promise<void>;
}

type TabQueryMock = ReturnType<typeof vi.fn<() => Promise<chrome.tabs.Tab[]>>>;

let storybook_tab_url = 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1';

(globalThis as Record<string, unknown>)['__storybook_set_tab_url'] = (url: string) => {
    storybook_tab_url = url;
    (chrome.tabs.query as TabQueryMock).mockResolvedValue([{ id: 1, url: storybook_tab_url } as chrome.tabs.Tab]);
};

async function flushAsync(): Promise<void> {
    await tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await tick();
}

const story_modules = import.meta.glob('../components/**/*.stories.ts', { eager: true });

for (const [path, module] of Object.entries(story_modules)) {
    const component_name = path.match(/([^/]+)\.stories\.ts$/)?.[1] ?? path;
    const composed = composeStories(module as StoryModule);

    describe(`[Story] ${component_name}`, () => {
        beforeEach(() => {
            storybook_tab_url = 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1';
            (chrome.tabs.query as TabQueryMock).mockResolvedValue([
                { id: 1, url: storybook_tab_url } as chrome.tabs.Tab,
            ]);
        });

        for (const [story_name, story] of Object.entries(composed)) {
            it(story_name, async () => {
                const composed_story = story as ComposedStory;
                const { container } = render(composed_story.Component, {
                    props: composed_story.props,
                });
                await flushAsync();
                if (typeof composed_story.play === 'function') {
                    await composed_story.play({ canvasElement: container });
                }
            });
        }
    });
}
