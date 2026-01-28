import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'Personal Logseq Plugin',
    description: 'Documentation for Personal Logseq Plugin',
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
                    ],
                },
                {
                    text: 'Development',
                    items: [
                        { text: 'Project Structure', link: '/guide/project-structure' },
                        { text: 'Configuration', link: '/guide/configuration' },
                        { text: 'Testing', link: '/guide/testing' },
                        { text: 'Vanilla Extract', link: '/guide/vanilla-extract' },
                        { text: 'MCP Server', link: '/guide/mcp-server' },
                    ],
                },
            ],
            '/api/': [
                {
                    text: 'API Reference',
                    items: [
                        { text: 'Overview', link: '/api/' },
                        { text: 'Components', link: '/api/components' },
                        { text: 'Hooks', link: '/api/hooks' },
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
