import type { StorybookConfig } from '@storybook/svelte-vite';
import type { Plugin } from 'vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

let cached_ts: any;
async function loadTypeScript() {
    if (!cached_ts) {
        const mod = await import('typescript/lib/typescript.js' as string);
        cached_ts = mod.default ?? mod;
    }
    return cached_ts;
}

function svelteCompilePlugin(): Plugin {
    return {
        name: 'svelte-compile',
        enforce: 'pre',
        async transform(code, id) {
            const clean_id = id.replace(/\?.*$/, '');

            if (clean_id.endsWith('.svelte')) {
                const { compile } = await import('svelte/compiler');
                const result = compile(code, {
                    filename: clean_id,
                    generate: 'client',
                });
                return { code: result.js.code, map: result.js.map };
            }

            if (clean_id.endsWith('.svelte.ts') || clean_id.endsWith('.svelte.js')) {
                let js_code = code;
                if (clean_id.endsWith('.svelte.ts')) {
                    const ts = await loadTypeScript();
                    const stripped = ts.transpileModule(code, {
                        compilerOptions: {
                            target: ts.ScriptTarget.ESNext,
                            module: ts.ModuleKind.ESNext,
                            verbatimModuleSyntax: false,
                        },
                        fileName: clean_id,
                    });
                    js_code = stripped.outputText;
                }

                const { compileModule } = await import('svelte/compiler');
                const result = compileModule(js_code, {
                    filename: clean_id,
                    generate: 'client',
                });
                return { code: result.js.code, map: result.js.map };
            }

            return null;
        },
    };
}

const config: StorybookConfig = {
    stories: ['../packages/*/src/**/*.stories.ts'],
    framework: {
        name: '@storybook/svelte-vite',
        options: { docgen: false },
    },
    viteFinal: async (config) => {
        config.plugins = config.plugins || [];
        config.plugins.unshift(svelteCompilePlugin());
        config.plugins.push(vanillaExtractPlugin());

        config.optimizeDeps = config.optimizeDeps || {};
        config.optimizeDeps.exclude = [...(config.optimizeDeps.exclude || []), '@storybook/svelte'];

        return config;
    },
};

export default config;
