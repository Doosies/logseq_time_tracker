---
name: git-workflow
description: "Git commit and PR workflow skill using Conventional Commits format. Use when generating commit messages (feat/fix/refactor/chore), creating PR descriptions, splitting changes into logical commits, analyzing git diffs, or recommending reviewers. Supports Korean PR descriptions with English commit messages."
---

# Git Workflow Skill

Specialized skill for git commit messages and PR management.

## When to Use

- Generating commit messages (Conventional Commits format)
- Creating PR descriptions
- Analyzing code changes for commit splitting
- Recommending reviewers

## Key Rules

- Conventional Commits format: `type(scope): description`
- Types: feat, fix, refactor, docs, chore, test, style, perf
- Logical commit splitting per feature/fix
- Korean PR descriptions with English commit messages

## Detailed References

Read from `references/` directory as needed:

- `references/commit-message-generation.md` - Commit message generation rules
- `references/change-analysis.md` - Code change analysis methodology
- `references/pr-description-generation.md` - PR description template
- `references/reviewer-recommendation.md` - Reviewer selection criteria
