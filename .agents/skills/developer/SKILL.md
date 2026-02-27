---
name: developer
description: Code implementation and refactoring skill. Use when implementing features from design docs, refactoring code, writing Svelte/TypeScript code, or developing MCP servers.
---

# Developer Skill

Specialized skill for code implementation and refactoring.

## When to Use

- Implementing new features from design documents
- Code refactoring and optimization
- Writing Svelte 5 components
- MCP server development
- Dependency and configuration management

## Quick Reference

### Naming Conventions
- Variables: `snake_case`
- Functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### Key Principles
- Zero linter errors (mandatory)
- Error handling included
- Testable code (dependency separation)
- No assumptions - read actual code

## Detailed References

Read from `references/` directory as needed:

- `references/code-implementation.md` - Implementation checklist and guide
- `references/refactoring-patterns.md` - Refactoring patterns
- `references/svelte-conventions.md` - Svelte 5 Runes conventions
- `references/testable-code.md` - Testable code patterns
- `references/auto-formatting.md` - Auto formatting rules
- `references/dependency-management.md` - Dependency audit and catalog
- `references/config-optimization.md` - tsconfig/eslint/vite optimization
- `references/monorepo-patterns.md` - pnpm workspace + turbo patterns
- `references/headless-components.md` - Headless component patterns
- `references/mcp/` - MCP server development guides (design, implementation, testing, deployment, pattern detection, tool gap analysis)
