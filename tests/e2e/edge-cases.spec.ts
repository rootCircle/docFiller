import {
  test,
  expect,
  setupMockAPIKeys,
  mockLLMResponses,
  openExtensionPopup,
} from './fixtures/extension-fixture';

test.describe('Edge Cases E2E Tests', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    await setupMockAPIKeys(context, extensionId);
    await mockLLMResponses(context);
  });

  test.describe('Edge Case Form Testing', () => {
    test('should handle required fields', async ({
      context,
      page,
      extensionId,
    }) => {
      test.skip(true, 'Requires network access to Google Forms');
      // Edge Cases Form URL - Form 3
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Wait for form to load
      await page.waitForSelector('div[role="heading"]');

      // Verify required field exists
      const requiredIndicator = page
        .locator('span[aria-label*="Required"]')
        .first();
      await expect(requiredIndicator).toBeVisible();

      // Verify the form title
      const formTitle = page.locator('div[role="heading"]').first();
      await expect(formTitle).toContainText(/Edge Cases/i);
    });

    test('should detect linear scale 1-10', async ({ context, page }) => {
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Look for linear scale with 10 options (1-10)
      const radioButtons = page.locator('div[role="radio"]');
      const count = await radioButtons.count();

      // Should have 10-point scale questions
      expect(count).toBeGreaterThan(9);
    });

    test('should detect multiple choice with Other option', async ({
      context,
      page,
    }) => {
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Look for "Other" option in multiple choice
      const otherOption = page
        .locator('span')
        .filter({ hasText: /^Other$/i })
        .first();
      await expect(otherOption).toBeVisible();
    });

    test('should detect checkboxes with Other option', async ({
      context,
      page,
    }) => {
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Look for checkbox elements
      const checkboxes = page.locator('div[role="checkbox"]');
      const checkboxCount = await checkboxes.count();

      // Should have checkboxes present
      expect(checkboxCount).toBeGreaterThan(0);
    });

    test('should detect star rating (1-5 scale)', async ({ context, page }) => {
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Look for star symbols (★)
      const starRating = page.locator('text=★★★★★').first();
      await expect(starRating).toBeVisible();
    });

    test('should detect conditional logic section', async ({
      context,
      page,
    }) => {
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Look for the conditional question
      const conditionalQuestion = page
        .locator('text=Do you have feedback?')
        .first();
      await expect(conditionalQuestion).toBeVisible();

      // Verify options exist
      const yesOption = page.locator('text=Yes, I have feedback').first();
      const noOption = page.locator("text=No, I'm good").first();
      await expect(yesOption).toBeVisible();
      await expect(noOption).toBeVisible();
    });

    test('should detect feedback section questions', async ({
      context,
      page,
    }) => {
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Look for feedback-related questions
      const feedbackQuestion = page
        .locator('text=What feedback do you have?')
        .first();
      await expect(feedbackQuestion).toBeVisible();

      const contactQuestion = page.locator('text=May we contact you').first();
      await expect(contactQuestion).toBeVisible();
    });

    test('should fill required field before submission', async ({
      context,
      page,
      extensionId,
    }) => {
      test.skip(true, 'Requires API keys and actual form filling capability');

      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Open extension popup
      const popup = await openExtensionPopup(context, extensionId);

      // Enable extension
      const toggleButton = popup.locator('#toggleButton');
      await toggleButton.click();

      // Click fill button
      const fillButton = popup.locator('.button-section-vertical-right');
      await fillButton.click();

      // Switch back to form page
      await page.bringToFront();

      // Wait a bit for filling to complete
      await page.waitForTimeout(2000);

      // Check that required field has been filled
      const firstInput = page.locator('input[type="text"]').first();
      const value = await firstInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    });

    test('should handle email validation', async ({ context, page }) => {
      test.skip(true, 'Form structure may vary, marking as optional');

      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Look for email field with validation
      const emailInputs = page.locator('input[type="email"]');
      const emailCount = await emailInputs.count();

      // Should have at least one email field
      expect(emailCount).toBeGreaterThan(0);
    });

    test('should navigate through all form sections', async ({
      context,
      page,
    }) => {
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Count all questions visible
      const questions = page.locator('div[role="listitem"]');
      const questionCount = await questions.count();

      // Form should have multiple questions
      expect(questionCount).toBeGreaterThan(5);
    });
  });

  test.describe('Edge Case Validation', () => {
    test('should detect various date/time field types', async ({
      context,
      page,
    }) => {
      test.skip(true, 'Form structure may vary, marking as optional');

      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Look for date fields
      const dateInputs = page.locator('input[aria-label*="Month"]');
      const dateCount = await dateInputs.count();

      // Should have date-related fields
      expect(dateCount).toBeGreaterThan(0);
    });

    test('should verify form structure integrity', async ({
      context,
      page,
    }) => {
      const edgeCaseFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdHZd8x6WQ94VOheBnVG2kMZhfrAaUpCGoNHH-0s2n_QAQJfg/viewform';

      await page.goto(edgeCaseFormUrl);
      await page.waitForLoadState('networkidle');

      // Verify form heading exists
      const heading = page.locator('div[role="heading"]').first();
      await expect(heading).toBeVisible();

      // Verify submit button exists
      const submitButton = page
        .locator('div[role="button"]')
        .filter({ hasText: /submit/i })
        .first();
      await expect(submitButton).toBeVisible();
    });
  });
});
