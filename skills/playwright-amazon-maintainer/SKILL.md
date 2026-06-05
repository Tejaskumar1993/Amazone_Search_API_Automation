---
name: playwright-amazon-maintainer
description: Maintain and stabilize Amazon.de Playwright smoke tests in this repository. Use when Codex needs to update `tests/*.spec.js`, harden selectors against Amazon interstitials or localization differences, debug browser-specific failures in Chromium/Firefox/WebKit, or validate changes with Playwright commands in this repo.
---

# Playwright Amazon Maintainer

## Overview

Use this skill to modify and validate the Amazon.de Playwright coverage in this repository without making the spec more brittle. Favor resilient selectors, browser-neutral waits, and assertions that distinguish between true breakage and Amazon's recoverable fallback states.

## Workflow

1. Read `tests/example.spec.js`, `playwright.config.js`, and [references/repo-notes.md](references/repo-notes.md).
2. Reproduce the failure with the narrowest useful Playwright command.
3. Patch the spec to improve reliability without overfitting to one browser run.
4. Re-run the affected browser first, then the full suite when the change touches shared helpers.

## Editing Rules

- Keep helper logic near the top of `tests/example.spec.js` so search-state behavior is easy to audit.
- Prefer reusable constants for selectors and URL patterns instead of duplicating literal strings across tests.
- Use waits that reflect page state changes such as `waitForURL`, visible search results, or visible recovery controls. Avoid stacking arbitrary long sleeps.
- Preserve the current testing intent: homepage smoke coverage, first search behavior, query persistence, and second-search behavior.
- Treat Amazon interstitials, consent prompts, and error pages as recoverable states. Handle them in helpers instead of spreading conditionals through each test.

## Validation

- Use the commands in [references/repo-notes.md](references/repo-notes.md).
- On Windows PowerShell, path arguments can behave like regex filters in Playwright CLI. If a direct file path does not match, use `--grep` or run the suite from `testDir`.
- If sandboxed execution blocks browser workers, rerun the same Playwright command outside the sandbox before diagnosing the spec itself.

## Output Expectations

- Report which browser and command reproduced the issue.
- Summarize any selector, wait, or fallback logic changes.
- State whether the updated spec passed on one browser or all configured browsers.
