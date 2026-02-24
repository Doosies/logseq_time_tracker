import '@testing-library/jest-dom/vitest';
import { setProjectAnnotations } from '@storybook/svelte-vite';

setProjectAnnotations({
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
});
