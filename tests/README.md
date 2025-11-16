# Testing Documentation

Welcome! This guide explains how we test the docFiller extension to make sure everything works reliably. Whether you're fixing a bug, adding a feature, or just curious about how we ensure quality, you're in the right place.

## Current Status

✅ **All 414 tests passing**  
📊 **81.3% code coverage** (well above our 70% target)  
⚡ **~2.5 seconds** to run the full suite

We've put a lot of effort into making our tests fast, reliable, and easy to understand. Let's dive in!

---

## Quick Start

Here are the commands you'll use most often:

```bash
# Run all tests (unit + integration)
npm test

# Watch mode - tests re-run as you edit code
npm run test:watch

# See which parts of the code are tested
npm run test:coverage

# Run end-to-end tests (tests the extension in a real browser)
npm run test:e2e

# Run everything
npm run test:all
```

---

## What Are We Testing?

We have three types of tests, each serving a different purpose:

### 1. Unit Tests (374 tests)

**What they do:** Test individual functions in isolation  
**Why they matter:** Catch bugs early, run super fast  
**Example:** "Does the date validator correctly reject February 30th?"

Think of these as testing individual LEGO bricks before building the castle.

### 2. Integration Tests (7 tests)

**What they do:** Test how different parts work together  
**Why they matter:** Make sure components don't break when combined  
**Example:** "Does the prompt engine → validator → filler chain work end-to-end?"

These test how the LEGO bricks connect and work as a structure.

### 3. End-to-End Tests (E2E)

**What they do:** Test the entire extension in a real browser with real Google Forms  
**Why they matter:** Verify the actual user experience  
**Example:** "Can the extension detect and fill a complete Google Form?"

These test the finished castle in the real world.

---

## How Our Tests Are Organized

```
tests/
├── README.md                 # You are here!
├── setup.ts                  # Stuff that runs before every test
│
├── mocks/                    # Fake versions of external things
│   ├── browser.mock.ts       # Pretends to be the browser's storage/tabs/etc
│   └── llm.mock.ts           # Pretends to be ChatGPT/Gemini responses
│
├── unit/                     # Tests for individual pieces
│   ├── engines/              # The core logic that fills forms
│   ├── utils/                # Helper functions
│   ├── storage/              # Browser storage stuff
│   ├── options/              # Options page UI
│   └── popup/                # Extension popup
│
├── integration/              # Tests for combined pieces
│   └── docFillerCore.integration.test.ts
│
└── e2e/                      # Tests in real browser
    ├── extension-ui.spec.ts
    ├── form-detection.spec.ts
    ├── form-filling.spec.ts
    └── edge-cases.spec.ts
```

---

## The Big Picture: What We Test

### Core Engines (232 tests)

These are the heart of the extension - the code that actually fills out forms.

**fillerEngine** (61 tests)

- Takes answers and puts them in the right fields
- Handles all 23 question types Google Forms supports
- Deals with tricky stuff like time pickers, grids, and "Other" options
- Example: "Can it fill a date field with the correct month/day/year?"

**promptEngine** (53 tests)

- Generates the questions we send to ChatGPT/Gemini
- Makes sure the AI understands what we're asking
- Example: "Does it format multiple-choice options correctly?"

**validatorEngine** (61 tests)

- Checks if AI responses actually make sense
- Converts dates to the right format
- Catches invalid answers before we try to fill them
- Example: "Does it reject '32/14/2024' as an invalid date?"

**detectBoxType** (62 tests)

- Figures out what type each question is (text, date, checkbox, etc.)
- This is critical - if we get it wrong, everything breaks!
- Example: "Can it tell the difference between a checkbox and a radio button?"

### Utilities (57 tests)

The helper functions that make everything work smoothly.

- **Date validation** - Makes sure dates are real (no February 30th!)
- **DOM helpers** - Safe ways to find elements on the page
- **Settings management** - Load and save user preferences
- **Consensus logic** - Combine answers from multiple AIs

### Storage (40 tests)

Everything related to saving and loading data.

- User profiles with custom prompts
- API keys for different AI services
- Extension settings
- Usage metrics

### UI Components (21 tests)

Tests for the parts users interact with.

- **Options page** - Settings, API keys, profiles
- **Popup** - The little window that opens when you click the extension
- **Background script** - Handles messages between different parts
- **Content script** - Runs on Google Forms pages

---

## How We Make Testing Work

### Challenge #1: Testing Without Real AI Calls

**Problem:** We can't call ChatGPT/Gemini in tests because:

- Tests would be slow
- Responses aren't predictable
- It would cost money on every test run
- CI servers might not have API keys

**Solution:** We created `llm.mock.ts` with realistic fake responses for every question type.

```typescript
// Instead of actually calling ChatGPT...
const response = await chatGPT.ask("What's your favorite color?");

// We return a pre-made answer
const response = { text: 'Blue' }; // From our mock
```

This means tests run in 2.5 seconds instead of 2.5 minutes, and we never get surprise bills!

### Challenge #2: Testing Browser Extensions

**Problem:** Extensions use special browser APIs (chrome.storage, chrome.tabs, etc.) that don't exist in test environments.

**Solution:** We created `browser.mock.ts` that pretends to be the browser.

```typescript
// This looks like real browser code...
await browser.storage.local.set({ apiKey: 'test-key' });
const data = await browser.storage.local.get('apiKey');

// But it's actually saving to a fake in-memory storage
// that we control completely
```

### Challenge #3: Testing Complex UI

**Problem:** The options page has tons of elements (dropdowns, inputs, buttons) and complex initialization logic.

**Solution:** We build a "rich DOM stub" - basically a fake version of the entire page in our tests.

```typescript
beforeEach(() => {
  // Create all the HTML elements the page needs
  document.body.innerHTML = `
    <select id="llmModel">
      <option value="ChatGPT">ChatGPT</option>
    </select>
    <button id="saveButton">Save</button>
  `;
});

// Now we can test interactions
it('saves settings when button is clicked', () => {
  const button = document.getElementById('saveButton');
  button.click();
  expect(saveWasCalled).toBe(true);
});
```

### Challenge #4: Testing Form Filling

**Problem:** We need to simulate Google Forms' complex DOM structure with all its weird attributes and behaviors.

**Solution:** We recreate realistic Google Forms HTML in our tests.

For example, Google Forms uses special attributes for time pickers:

```typescript
// Create a realistic meridiem (AM/PM) dropdown
const meridiemButton = document.createElement('div');
meridiemButton.setAttribute('role', 'listbox');

// Add AM and PM options just like Google does
['AM', 'PM'].forEach((value) => {
  const span = document.createElement('span');
  span.setAttribute('data-value', value);
  span.textContent = value;
  meridiemButton.appendChild(span);
});

// Now test if we can select PM correctly
await fillerEngine.fill(fieldValue, { time: '18:30' }); // 6:30 PM
expect(pmSpan.getAttribute('data-selected')).toBe('true');
```

---

## Understanding Test Coverage

We aim for **70% coverage** as a minimum. Here's what that means:

### What Gets Measured

**Statements:** Lines of code that actually run  
**Branches:** Different paths (if/else, switch cases)  
**Functions:** Whether each function is called  
**Lines:** Physical lines in the file

### Our Current Coverage

| What       | Coverage | Target | Status        |
| ---------- | -------- | ------ | ------------- |
| Statements | 81.3%    | 70%    | ✅ Exceeding! |
| Branches   | 67.3%    | 60%    | ✅ Good       |
| Functions  | 90.9%    | 70%    | ✅ Excellent! |
| Lines      | 81.3%    | 70%    | ✅ Exceeding! |

### What's NOT Covered (And Why That's Okay)

Some files are excluded from coverage requirements:

- **UI-heavy files** - Hard to test without a real browser, better covered by E2E tests
- **Type definitions** - Nothing to test, just TypeScript types
- **Simple utilities** - Things like message type constants don't need tests

---

## Writing Your First Test

Here's a simple example of how to write a test:

```typescript
import { describe, it, expect } from 'vitest';
import { validateDate } from '@utils/validationUtils';

describe('Date Validation', () => {
  it('accepts valid dates', () => {
    // Arrange - set up test data
    const validDate = '2024-12-25';

    // Act - run the code we're testing
    const result = validateDate(validDate);

    // Assert - check if it worked
    expect(result).toBe(true);
  });

  it('rejects impossible dates', () => {
    const impossibleDate = '2024-02-30'; // February doesn't have 30 days

    const result = validateDate(impossibleDate);

    expect(result).toBe(false);
  });
});
```

This follows the **Arrange-Act-Assert** pattern:

1. **Arrange** - Set up what you need for the test
2. **Act** - Run the code you're testing
3. **Assert** - Check if it did what you expected

---

## Common Testing Patterns We Use

### Pattern 1: Mocking Dependencies

When testing one piece of code, we often need to fake its dependencies:

```typescript
import { vi } from 'vitest';
import { saveSettings } from './settings';
import { showToast } from './toastUtils';

// Tell Vitest to fake the toast function
vi.mock('./toastUtils', () => ({
  showToast: vi.fn(),
}));

it('shows success message after saving', async () => {
  await saveSettings({ theme: 'dark' });

  // Check if the toast was shown
  expect(showToast).toHaveBeenCalledWith('Saved!', 'success');
});
```

### Pattern 2: Testing Async Code

Many extension operations are asynchronous:

```typescript
it('loads settings from storage', async () => {
  // Setup mock storage with some data
  await browser.storage.local.set({ theme: 'dark' });

  // Load settings
  const settings = await loadSettings();

  // Verify we got the right data
  expect(settings.theme).toBe('dark');
});
```

Notice the `async` and `await` keywords - these are important for async tests!

### Pattern 3: Testing Error Handling

Good code handles errors gracefully:

```typescript
it('handles invalid API responses', async () => {
  // Make the API return garbage
  mockAPI.mockResolvedValue({ invalid: 'data' });

  // Our code should handle this without crashing
  const result = await processResponse();

  expect(result).toBeNull();
  expect(errorWasLogged).toBe(true);
});
```

---

## Debugging When Tests Fail

### Step 1: Read the Error Message

Test failures usually tell you exactly what went wrong:

```
Expected: 42
Received: 43
```

This means you expected the function to return 42, but it returned 43 instead.

### Step 2: Run Just That Test

Don't run all 414 tests - run just the one that's failing:

```bash
npm test tests/unit/engines/fillerEngine.test.ts
```

Or even more specific:

```bash
npm test -- --grep "fills date fields"
```

### Step 3: Add Debug Logs

Sometimes you need to see what's happening:

```typescript
it('processes data correctly', () => {
  const input = { value: 42 };
  const result = processData(input);

  console.log('Input:', input);
  console.log('Result:', result);

  expect(result.value).toBe(42);
});
```

### Step 4: Use the Visual Test Runner

The UI makes it much easier to see what's happening:

```bash
npm run test:ui
```

This opens a browser with a visual test runner where you can:

- See which tests are failing
- Click to run individual tests
- View console logs
- See code coverage in real-time

---

## Common Issues and Solutions

### "Test timeout exceeded"

**Cause:** Your test is waiting for something that never happens  
**Solution:** Make sure all promises are awaited and there are no infinite loops

```typescript
// Bad - missing await
it('loads data', () => {
  loadData(); // This returns a promise!
  expect(data).toBeDefined(); // Runs before loadData finishes
});

// Good - with await
it('loads data', async () => {
  await loadData(); // Wait for it to finish
  expect(data).toBeDefined(); // Now this works
});
```

### "Mock function not called"

**Cause:** Either the mock isn't set up right, or the code path doesn't call it  
**Solution:** Check that:

1. The mock is created before the import
2. The code actually reaches the line that should call the mock
3. The mock is from the right module

### "Cannot read property X of undefined"

**Cause:** You're trying to access something that doesn't exist  
**Solution:** Make sure all required setup is in `beforeEach`:

```typescript
beforeEach(() => {
  // Create the DOM elements tests need
  document.body.innerHTML = '<button id="saveButton">Save</button>';

  // Reset mocks
  vi.clearAllMocks();
});
```

### Tests Pass Locally but Fail in CI

**Cause:** Different timing, missing environment variables, or test pollution  
**Solution:**

- Use `vi.resetModules()` to ensure clean state
- Don't rely on specific timing (use proper async/await)
- Make sure tests don't depend on each other

---

## Best Practices

### ✅ Do This

**Write descriptive test names**

```typescript
it('rejects API keys shorter than 20 characters', () => { ... });
```

**Test one thing per test**

```typescript
// Each test should verify one specific behavior
it('validates email format', () => { ... });
it('validates email length', () => { ... });
it('normalizes email to lowercase', () => { ... });
```

**Test edge cases**

```typescript
it('handles empty input', () => { ... });
it('handles very long input', () => { ... });
it('handles special characters', () => { ... });
```

**Clean up after tests**

```typescript
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});
```

### ❌ Don't Do This

**Vague test names**

```typescript
it('test1', () => { ... }); // What does this test?
it('works', () => { ... }); // Too generic
```

**Tests that depend on order**

```typescript
// Bad - test2 depends on test1 running first
it('test1: saves data', () => {
  saveData();
});
it('test2: loads data', () => {
  loadData();
}); // Assumes test1 ran
```

**Testing implementation details**

```typescript
// Bad - testing how it works internally
expect(internalState.cacheHit).toBe(true);

// Good - testing what it does
expect(result).toBe(expectedValue);
```

**Slow tests**

```typescript
// Bad - waits for real timeout
await new Promise((resolve) => setTimeout(resolve, 5000));

// Good - uses fake timers
vi.useFakeTimers();
vi.advanceTimersByTime(5000);
```

---

## Continuous Integration

Tests run automatically on every pull request and commit to main. This ensures:

- No broken code gets merged
- Coverage stays above our thresholds
- Code style is consistent
- TypeScript compiles without errors

The pre-commit hook runs before you commit:

```bash
npm run precommit
```

This runs:

1. All tests
2. Linting (code style checks)
3. Type checking
4. Spell checking

If anything fails, the commit is blocked. Fix the issues and try again!

---

## Tips for Success

### When Adding a New Feature

1. **Write the test first** (Test-Driven Development)
   - Think about how the feature should work
   - Write a test that would pass if it worked
   - Implement the feature until the test passes

2. **Test the happy path and error paths**
   - Normal usage (what should happen)
   - Error cases (what could go wrong)
   - Edge cases (weird but valid inputs)

3. **Keep tests simple**
   - If a test is hard to write, the code might be too complex
   - Consider refactoring to make it more testable

### When Fixing a Bug

1. **Write a test that reproduces the bug**
   - The test should fail before your fix
   - The test should pass after your fix
   - This prevents the bug from coming back

2. **Keep the test even after fixing**
   - This is your "regression test"
   - If the bug comes back, the test catches it

### When Reviewing Code

Look for:

- ✅ Tests are included for new code
- ✅ Tests are clear and understandable
- ✅ Edge cases are covered
- ✅ Coverage stays above thresholds
- ✅ Tests actually test the behavior, not the implementation

---

## Getting Help

### Resources

- **This file** - Overview of our testing approach
- **[docs/TESTING.md](../docs/TESTING.md)** - More detailed testing guide
- **[docs/GOOGLE_FORMS_SETUP.md](../docs/GOOGLE_FORMS_SETUP.md)** - Setting up E2E tests
- **[Vitest Docs](https://vitest.dev/)** - Our testing framework
- **[Playwright Docs](https://playwright.dev/)** - E2E testing framework

### Questions?

If something isn't clear:

1. Check the test files - they're often the best documentation
2. Ask in pull request comments
3. Open an issue if documentation is unclear

Remember: **There are no stupid questions!** Testing can be confusing, and if you're confused, others probably are too. Asking helps improve our documentation for everyone.

---

## Final Thoughts

Testing might seem like extra work, but it actually **saves** time:

- Catch bugs before they reach users
- Refactor confidently knowing tests will catch breaks
- Understand code better by seeing how it's used
- Onboard new developers faster with executable examples

Our test suite is one of the best investments we've made in the project. Every test added is a bug prevented!

---

**Happy Testing! 🧪**

_Last updated: November 14, 2025_  
_Test count: 414 and growing_  
_Coverage: 81.3% (and proud of it!)_
