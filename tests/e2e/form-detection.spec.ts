import {
  test,
  expect,
  setupMockAPIKeys,
  mockLLMResponses,
} from './fixtures/extension-fixture';

test.describe('Form Detection', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    await setupMockAPIKeys(context, extensionId);
    await mockLLMResponses(context);
  });

  test.describe('Real Google Forms', () => {
    test('should detect form on simple Google Form', async ({
      context,
      page,
    }) => {
      test.skip(true, 'Requires Google Form access and network');

      // Simple Form URL - Form 1
      const testFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSfcj5lfCdnGakZNq93pQ0JCgnSd1mBJd2FvMSUBeKElUlLJJA/viewform';

      await page.goto(testFormUrl);

      // Wait for form to load
      await page.waitForSelector('div[role="listitem"]');

      // Verify extension detects questions
      const questions = await page.locator('div[role="listitem"]').count();
      expect(questions).toBeGreaterThan(0);
    });

    test('should detect all question types', async ({ context, page }) => {
      test.skip(true, 'Requires Google Form access and network');

      // Comprehensive Form URL - Form 2
      const comprehensiveFormUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSdzCu_VB9ddGldroKayb-aiQJOTblHuBP93nOD_L0CaiVF-ew/viewform';

      await page.goto(comprehensiveFormUrl);

      // Verify different question types are detected
      // TEXT
      await expect(page.locator('input[type="text"]').first()).toBeVisible();

      // EMAIL
      await expect(page.locator('input[type="email"]').first()).toBeVisible();

      // PARAGRAPH
      await expect(page.locator('textarea').first()).toBeVisible();

      // MULTIPLE CHOICE
      await expect(page.locator('div[role="radio"]').first()).toBeVisible();

      // CHECKBOX
      await expect(page.locator('div[role="checkbox"]').first()).toBeVisible();

      // DROPDOWN
      await expect(page.locator('div[role="listbox"]').first()).toBeVisible();
    });

    test('should handle forms with sections', async ({ context, page }) => {
      test.skip(true, 'Waiting for test Google Form creation');

      // Test form with multiple sections
      // Verify navigation between sections works
    });

    test('should handle required vs optional questions', async ({
      context,
      page,
    }) => {
      test.skip(true, 'Waiting for test Google Form creation');

      // Test form with mix of required and optional questions
      // Verify extension correctly identifies required fields
    });
  });

  test.describe('Question Extraction', () => {
    test('should extract question title', async ({ context, page }) => {
      test.skip(true, 'Waiting for test Google Form creation');

      // Verify extension can extract question titles
    });

    test('should extract question description', async ({ context, page }) => {
      test.skip(true, 'Waiting for test Google Form creation');

      // Verify extension can extract question descriptions when present
    });

    test('should extract options for MCQ questions', async ({
      context,
      page,
    }) => {
      test.skip(true, 'Waiting for test Google Form creation');

      // Verify extension can extract multiple choice options
    });
  });
});
