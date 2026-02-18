# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# GEMINI.md

This file provides guidance to Gemini Gemini Code Assist (codeassist.google) when working with code in this repository.

# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

---

## Project Overview

NestJS v11 marketplace server (TypeScript, Express). Currently a starter scaffold with a single root module — feature modules (products, users, orders, etc.) will be added as the project grows.

### Tech Stack

- **Runtime**: Node.js with NestJS v11 + Express v5
- **Language**: TypeScript 5.7 (target ES2023, `nodenext` modules, strict null checks, `noImplicitAny: false`)
- **Testing**: Jest 30 + Supertest
- **Linting**: ESLint 9 (flat config) + typescript-eslint + Prettier
- **Package manager**: Yarn

### Development Commands

```bash
yarn install              # Install dependencies
yarn start:dev            # Dev server with watch mode (port 3000)
yarn start:debug          # Debug server with --inspect-brk
yarn build                # Compile to dist/
yarn start:prod           # Run compiled output

yarn test                 # Unit tests (Jest, rootDir: src/)
yarn test -- --testPathPattern=<pattern>  # Run a single test file
yarn test:watch           # Tests in watch mode
yarn test:cov             # Tests with coverage
yarn test:e2e             # E2E tests (config: test/jest-e2e.json)

yarn lint                 # ESLint with auto-fix
yarn format               # Prettier format src/ and test/
```

### Architecture

```
src/
├── main.ts               # Entry point — creates app, listens on PORT env var or 3000
├── app.module.ts          # Root module (imports, controllers, providers)
├── app.controller.ts      # Root controller (GET /)
├── app.service.ts         # Root service
└── app.controller.spec.ts # Unit test for root controller
test/
└── app.e2e-spec.ts        # E2E test
```

NestJS conventions: modules in `*.module.ts`, controllers in `*.controller.ts`, services in `*.service.ts`, tests co-located as `*.spec.ts`.

### Internal Docs

Project documentation lives in `src/docs/`. When a task touches a topic covered there (setup, configuration, features, troubleshooting), read the relevant doc before implementing.

→ [src/docs/README.md](src/docs/README.md) — index of all docs

### ESLint Rules of Note

- `@typescript-eslint/no-explicit-any`: **error**
- `@typescript-eslint/no-floating-promises`: warn
- `@typescript-eslint/no-unsafe-argument`: warn
- Prettier enforced via ESLint (`endOfLine: "auto"`)

---

## Synchronization Policy

**CRITICAL**: This codebase uses 3 AI assistants. When adding or modifying ANY of the following, ALL related files MUST be updated in the same change:

### 1. Instruction Files (Always sync together)

| File        | AI Assistant       |
| ----------- | ------------------ |
| `CLAUDE.md` | Claude Code        |
| `GEMINI.md` | Gemini Code Assist |
| `AGENTS.md` | Codex              |

### 2. Commands (Source of truth + Codex runtime mapping)

When adding/modifying a command:

| Location                        | Action                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `.claude/commands/<name>.md`    | Create/update command file                                                         |
| `.claude/COMMANDS.md`           | Add to commands table                                                              |
| `.codex/skills/<name>/SKILL.md` | Update/create only if command should be auto-runnable by Codex via intent matching |
| `CLAUDE.md`                     | Update "Available Commands & Skills" table                                         |
| `GEMINI.md`                     | Update "Available Commands & Skills" table                                         |
| `AGENTS.md`                     | Update "Available Commands & Skills" table                                         |

### 3. Skills (Cross-assistant mapping)

When adding/modifying a skill:

| Location                         | Format                                   | Action                                     |
| -------------------------------- | ---------------------------------------- | ------------------------------------------ |
| `.claude/skills/<name>.md`       | Markdown (no frontmatter)                | Create/update skill (source of truth)      |
| `.codex/skills/<name>/SKILL.md`  | With frontmatter (`name`, `description`) | Create folder + SKILL.md                   |
| `.gemini/skills/<name>/SKILL.md` | With frontmatter (`name`, `description`) | Create folder + SKILL.md (same as Codex)   |
| `.claude/COMMANDS.md`            | -                                        | Add to skills section                      |
| `CLAUDE.md`                      | -                                        | Update "Available Commands & Skills" table |
| `GEMINI.md`                      | -                                        | Update "Available Commands & Skills" table |
| `AGENTS.md`                      | -                                        | Update "Available Commands & Skills" table |

### Skill Frontmatter Format (.codex/skills/\*/SKILL.md and .gemini/skills/\*/SKILL.md)

```yaml
---
name: skill-name
description: Brief description of what this skill does
---
```

### Sync Checklist

Before completing any command/skill change, verify:

- [ ] All 3 instruction files updated
- [ ] `.claude/COMMANDS.md` updated for command/skill catalog changes
- [ ] Every skill has matching `.codex/skills/<name>/SKILL.md` and `.gemini/skills/<name>/SKILL.md`

---

## Context7 MCP Usage

**IMPORTANT**: Always use Context7 MCP proactively when you need to use library's API without the user having to explicitly ask.

---

## Browser Debugging Workflow

**IMPORTANT**: When browser debugging is needed:

1. **First, check for existing browser**: Use `tabs_context_mcp` to check if there's already a running browser with a LIGHTBEAM tab (check for `localhost:8020` URL)
2. **Connect automatically**: If the LIGHTBEAM tab exists, connect to it without asking the user
3. **Ask only if needed**: Only if the tab is not found or browser is not running, ask the user to open a browser in debugging mode

This ensures a smoother debugging workflow by reusing existing browser sessions when available.

---

## Development Automation

The following slash commands and skills automate common development workflows.
For Claude Code: [.claude/COMMANDS.md](.claude/COMMANDS.md) for canonical command/skill documentation
For Codex: use `.codex/skills/*/SKILL.md` as Codex runtime skill files
For Gemini: use `.gemini/skills/*/SKILL.md` as Gemini runtime skill files

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
