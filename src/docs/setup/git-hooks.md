# Git Hooks Setup

This project uses native Git hooks stored in [`/.githooks`](../../../.githooks) to run local quality checks before changes are committed or pushed.

## Installation

Hooks are installed automatically by the `prepare` script in [`package.json`](../../../package.json) when you run:

```bash
yarn install
```

That script configures this clone's Git metadata to use:

```bash
git config core.hooksPath .githooks
```

If hooks stop running in an existing clone, re-run `yarn install` or `yarn prepare`.

## Active Hooks

- `pre-commit` -> runs `yarn lint:check`
- `pre-push` -> runs `yarn lint:check` and `yarn test`

These hooks are local guardrails for normal development flow. CI remains the source of truth for pull request verification.
