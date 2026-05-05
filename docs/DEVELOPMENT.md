# Development Guide

This document describes the development workflow, commit standards, and release process for this project.

---

## Overview

This project follows a structured workflow inspired by real-world engineering practices:

- Conventional Commits
- Commit validation with Husky and Commitlint
- Commit assistance with Commitizen
- Automated versioning and changelog generation

---

## Branch Strategy

Create a new branch for every change:

```bash
git checkout -b feat/<feature-name>
git checkout -b fix/<bug-name>
git checkout -b chore/<task-name>
```

Examples:

```bash
feat/bff-dashboard
fix/user-auth
chore/update-deps
```

---

## Development

- Work only within the relevant service (e.g., bff, user-service)
- Keep responsibilities isolated
- Prefer small, incremental changes

---

## Staging Changes

```bash
git add .
```

---

## Commit Standard (MANDATORY)

All commits must follow Conventional Commits.

Use:

```bash
pnpm commit
```

You will be prompted to:

- Select type (feat, fix, chore, etc.)
- Define scope (bff, user-service, etc.)
- Write a clear description

Examples:

```bash
feat(bff): add dashboard aggregation endpoint
fix(user-service): handle invalid token
chore(infra): update docker-compose
```

Avoid:

```bash
update stuff
fix bug
wip
```

---

## Git Hooks (Husky)

Hooks run automatically on commit:

- pre-commit → code validation (optional)
- commit-msg → enforces commit message standard

If a commit is invalid, it will be blocked.

---

## Iteration

Repeat:

```bash
git add .
pnpm commit
```

Keep commits:

- small
- focused
- descriptive

---

## Push Changes

```bash
git push origin <branch-name>
```

---

## Merge

Merge into main:

```bash
git checkout main
git merge <branch-name>
```

(Optional: use Pull Requests for a more realistic workflow)

---

## Release Process

Releases are automated using standard-version.

First release:

```bash
pnpm release --first-release
```

Next releases:

```bash
pnpm release
```

This will:

- Update version in package.json
- Generate or update CHANGELOG.md
- Create a release commit
- Create a Git tag (e.g., v1.0.0)

---

## Push Release

```bash
git push --follow-tags
```

---

## Commit Impact on Version

| Commit Type     | Version Impact |
| --------------- | -------------- |
| feat            | minor          |
| fix             | patch          |
| BREAKING CHANGE | major          |

---

## Scopes Convention

Use consistent scopes:

- bff
- user-service
- agent-service
- conversation-service
- infra
- libs

---

## Rules

- Always use pnpm commit
- Do not bypass commit validation
- Do not mix multiple concerns in one commit
- Keep history clean and readable

---

## Summary

```
branch → code → add → commit → push → merge → release
```

---

## Future Improvements

- CI/CD pipeline
- Automated tests
- Python linting integration
- Pull request templates
