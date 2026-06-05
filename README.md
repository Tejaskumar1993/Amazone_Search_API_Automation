# my-playwright

Monorepo for Amazon.de Playwright coverage and a simple MCP server example.

The Playwright suite now follows a hybrid framework structure: page objects for domain flows, a shared header component for reusable UI, custom fixtures for dependency injection, and data-driven specs.

## Project structure

- `tests/specs/amazon/amazon-search-and-cart.spec.js`: End-to-end checks for search, product, and cart entry flows.
- `tests/pages/`: Page objects for home, results, product, and cart flows.
- `tests/components/`: Reusable component objects shared across pages.
- `tests/fixtures/amazon-test.js`: Custom Playwright fixtures that wire page objects into tests.
- `tests/data/search-data.js`: Shared test data for queries.
- `playwright.config.js`: Playwright config for Chromium, Firefox, and WebKit.
- `my-mcp-server/`: TypeScript MCP server with a sample `hello` tool.
- `.github/workflows/playwright.yml`: CI workflow that installs dependencies, builds the workspace, and runs Playwright tests.
- `skills/playwright-amazon-maintainer/`: Repository skill notes for maintaining the Playwright suite.

## Requirements

- Node.js 20 or newer recommended
- npm 11 or newer

## Install

```bash
npm ci
```

Install Playwright browsers if this is the first local run:

```bash
npx playwright install
```

## Optional Amazon login session

To run the Amazon tests with your own signed-in browser session, save auth once:

```bash
npm run auth:amazon
```

Complete the login in the opened browser, then press Enter in the terminal. The session is saved under `playwright/.auth/`, which is ignored by git. Future Playwright runs reuse that session automatically and do not perform logout.

## Available scripts

From the repository root:

```bash
npm run auth:amazon
npm test
npm run test:headed
npm run test:report
npm run build
npm run build:server
npm run test:server
```

## What the tests cover

The Playwright suite targets `https://www.amazon.de/` and validates:

- home page header and shopping entry points
- product search behavior for multiple queries
- query persistence in the search box
- product-page entry and add-to-cart initiation
- resilience around consent dialogs and recoverable fallback pages

## Playwright framework layout

```text
tests/
  components/
    amazon-header.js
  data/
    search-data.js
  fixtures/
    amazon-test.js
  pages/
    amazon-cart-page.js
    amazon-home-page.js
    amazon-product-page.js
    amazon-results-page.js
  specs/
    amazon/
      amazon-search-and-cart.spec.js
```

This layout aligns with current Playwright guidance around page object models, fixtures, and resilient user-facing locators:

- POM for business flows and selectors with high reuse
- component objects for cross-page UI such as the Amazon header
- custom fixtures instead of large `beforeAll` state blocks
- spec files kept focused on intent rather than locator plumbing

## MCP server

Build and run the sample MCP server workspace package:

```bash
npm run build:server
npm run dev --workspace my-mcp-server
```

The sample server currently exposes one tool named `hello` that returns a simple text response.

## CI

GitHub Actions runs on pushes and pull requests to `main` and `master`. The workflow installs dependencies, restores Turbo cache, installs Playwright browsers, builds the workspace, and runs the Playwright suite.
