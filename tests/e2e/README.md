# E2E Test Setup Guide

## Quick Start

### 1. Set up API Key

```bash
# Set Gemini API key (required for tests)
export GEMINI_API_KEY="your-api-key-here"

# Or create a .env file in the project root
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

### 2. Run Tests

```bash
# Build extension
npm run build:chromium

# Run all e2e tests
npm run test:e2e

# Run specific tests
npm run test:e2e -- --grep "should fill text field"

# Run with visible browser
npm run test:e2e:headed
```

## How It Works

The e2e tests automatically:

1. Build and load the extension in Playwright's Chromium
2. Detect and cache the extension ID
3. Set up mock API keys via service worker
4. Enable the extension before navigating to forms
5. Verify form filling functionality

## Architecture

### Extension Loading

- Uses Playwright's bundled Chromium for reliability
- Loads extension via `launchPersistentContext` with `--load-extension` flag
- Extension ID is auto-detected from service workers and cached in `tests/e2e/.extension-id`

### API Key Setup

- Mock Gemini API key is injected via service worker before tests run
- Extension is automatically enabled with `isEnabled: true`
- This happens in `beforeEach` hook, ensuring clean state per test

### Form Filling Tests

Tests follow this pattern:

1. Open extension popup and verify it's enabled
2. Close popup and navigate to Google Form
3. Extension auto-detects form and fills fields
4. Verify fields contain expected values

## Files

- `tests/e2e/fixtures/extension-fixture.ts` - Core test setup and extension loading
- `tests/e2e/.extension-id` - Cached extension ID (gitignored)
- `tests/e2e/form-filling.spec.ts` - Main form filling tests
- `tests/e2e/extension-ui.spec.ts` - UI and popup tests

## Troubleshooting

### Tests hang or timeout

```bash
pkill -9 -i chrom
rm -rf /Users/gkatiyar/Downloads/docFiller/.test-user-data
npm run test:e2e
```

### Extension not loading

```bash
npm run build:chromium
rm tests/e2e/.extension-id
npm run test:e2e
```

### Extension ID not detected

The first run may be slower as it detects and caches the ID. Subsequent runs use the cached ID for faster execution.
