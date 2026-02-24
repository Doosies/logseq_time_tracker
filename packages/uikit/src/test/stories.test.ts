import { describe, it } from 'vitest';
import { composeStories } from '@storybook/svelte-vite';

type StoryModule = Parameters<typeof composeStories>[0];

const story_modules = import.meta.glob('../components/**/*.stories.ts', { eager: true });

for (const [path, module] of Object.entries(story_modules)) {
    const component_name = path.match(/([^/]+)\.stories\.ts$/)?.[1] ?? path;
    const composed = composeStories(module as StoryModule);

    describe(`[Story] ${component_name}`, () => {
        for (const [story_name, story] of Object.entries(composed)) {
            it(story_name, async () => {
                await (story as { run: () => Promise<void> }).run();
            });
        }
    });
}
