import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'Personal Monorepo',
    description: 'Svelte 5 UIKit, Chrome Extension, MCP Server 모노레포 문서',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/' },
            { text: 'API', link: '/api/' },
        ],
        sidebar: {
            '/guide/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Introduction', link: '/guide/' },
                        { text: 'Installation', link: '/guide/installation' },
                        { text: 'Quick Start', link: '/guide/quick-start' },
                        { text: 'Project Structure', link: '/guide/project-structure' },
                    ],
                },
                {
                    text: 'Development',
                    items: [
                        { text: 'Configuration', link: '/guide/configuration' },
                        { text: 'Testing', link: '/guide/testing' },
                        { text: 'Vanilla Extract', link: '/guide/vanilla-extract' },
                        { text: 'Storybook', link: '/guide/storybook' },
                    ],
                },
                {
                    text: 'References',
                    items: [
                        { text: 'MCP Server', link: '/guide/mcp-server' },
                        { text: 'Logseq Plugin API', link: '/guide/logseq-plugin-api' },
                    ],
                },
            ],
            '/api/': [
                {
                    text: 'UIKit API',
                    items: [
                        { text: 'Overview', link: '/api/' },
                        { text: 'Components', link: '/api/components' },
                        { text: 'Actions', link: '/api/actions' },
                        { text: 'Design Tokens', link: '/api/design-tokens' },
                    ],
                },
            ],
        },
        socialLinks: [{ icon: 'github', link: 'https://github.com/yourusername/personal' }],
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2026-present',
        },
    },
});
