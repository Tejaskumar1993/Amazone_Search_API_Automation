# Repo Notes

## Relevant files

- `tests/example.spec.js`: Amazon.de smoke coverage with helpers for homepage recovery, interstitial handling, and repeated searches.
- `playwright.config.js`: Runs Chromium, Firefox, and WebKit against `https://www.amazon.de/`.
- `package.json`: Main validation entry points are `npm test`, `npm run test:headed`, and `npm run test:report`.

## Validation commands

- Full suite: `npx playwright test --workers=1`
- Single browser: `npx playwright test --project=chromium --workers=1`
- Single file from PowerShell: `npx playwright test --grep "amazon.de validation coverage"`

## Stability notes

- Prefer selectors that tolerate localized text and alternate interstitials.
- Treat Amazon search as successful when a search-results URL is reached or when Amazon returns to a homepage-style fallback after a recoverable error.
- Keep assertions focused on stable shopping primitives like the search box, cart, logo, and visible search results.
