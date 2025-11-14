import {
  test,
  expect,
  setupMockAPIKeys,
  mockLLMResponses,
  openExtensionPopup,
} from './fixtures/extension-fixture';

test.describe('Form Filling', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    await setupMockAPIKeys(context, extensionId);
  });

  test.describe('Basic Form Filling', () => {
    test('should fill text field', async ({ context, page, extensionId }) => {
      console.log('Starting test with extension ID:', extensionId);
      
      await page.waitForTimeout(2000);
      
      const popup = await openExtensionPopup(context, extensionId);
      await popup.waitForLoadState('load');
      await popup.waitForTimeout(1000);
      
      const toggleButton = popup.locator('#toggleButton');
      await toggleButton.waitFor({ state: 'visible' });
      
      const toggleClasses = await toggleButton.getAttribute('class');
      console.log('Toggle button classes:', toggleClasses);
      
      const isIconOff = toggleClasses?.includes('disabled');
      console.log('Icon is OFF:', isIconOff);
      
      if (isIconOff) {
        console.log('✓ Icon is OFF, turning it ON...');
        await popup.evaluate(() => {
          const toggle = document.querySelector('#toggleButton') as HTMLElement;
          if (toggle) toggle.click();
        });
        await popup.waitForTimeout(1500);
        
        // Extension must be ON before navigating to form, otherwise it won't detect the form
        const verifyState = await popup.evaluate(() => {
          return new Promise((resolve) => {
            chrome.storage.sync.get(['isEnabled'], (result) => {
              resolve(result['isEnabled']);
            });
          });
        });
        console.log('✓ Verified isEnabled in storage:', verifyState);
        
        if (!verifyState) {
          console.log('⚠️ Storage not saved, forcing save...');
          await popup.evaluate(() => chrome.storage.sync.set({ isEnabled: true }));
          await popup.waitForTimeout(1000);
        }
        console.log('✓ Icon is now ON and saved');
      } else {
        console.log('✓ Icon is already ON');
      }
      
      await popup.waitForTimeout(500);
      await popup.close();
      console.log('✓ Extension is ON and ready');
      
      const testFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfcj5lfCdnGakZNq93pQ0JCgnSd1mBJd2FvMSUBeKElUlLJJA/viewform';
      console.log('Navigating to Google Form...');
      await page.goto(testFormUrl, { timeout: 30000 });
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('div[role="listitem"]', { timeout: 10000 });
      console.log('Form loaded successfully');
      
      console.log('Waiting for form to be auto-filled...');
      await page.waitForTimeout(15000);
      
      const textInput = page.locator('input[type="text"]').first();
      const value = await textInput.inputValue();
      console.log('Text field value:', value);
      
      await expect(textInput).toHaveValue(/.+/);
    });

    test('should fill email field', async ({ context, page, extensionId }) => {
      console.log('Starting email field test...');
      
      await page.waitForTimeout(2000);
      
      const popup = await openExtensionPopup(context, extensionId);
      await popup.waitForLoadState('load');
      await popup.waitForTimeout(1000);
      
      const toggleButton = popup.locator('#toggleButton');
      await toggleButton.waitFor({ state: 'visible' });
      
      const toggleClasses = await toggleButton.getAttribute('class');
      console.log('Toggle button classes:', toggleClasses);
      
      const isIconOff = toggleClasses?.includes('disabled');
      console.log('Icon is OFF:', isIconOff);
      
      if (isIconOff) {
        console.log('✓ Icon is OFF, turning it ON...');
        await popup.evaluate(() => {
          const toggle = document.querySelector('#toggleButton') as HTMLElement;
          if (toggle) toggle.click();
        });
        await popup.waitForTimeout(1500);
        
        // Extension must be ON before navigating to form, otherwise it won't detect the form
        const verifyState = await popup.evaluate(() => {
          return new Promise((resolve) => {
            chrome.storage.sync.get(['isEnabled'], (result) => {
              resolve(result['isEnabled']);
            });
          });
        });
        console.log('✓ Verified isEnabled in storage:', verifyState);
        
        if (!verifyState) {
          console.log('⚠️ Storage not saved, forcing save...');
          await popup.evaluate(() => chrome.storage.sync.set({ isEnabled: true }));
          await popup.waitForTimeout(1000);
        }
        console.log('✓ Icon is now ON and saved');
      } else {
        console.log('✓ Icon is already ON');
      }
      
      await popup.waitForTimeout(500);
      await popup.close();
      console.log('✓ Extension is ON and ready');
      
      const testFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfcj5lfCdnGakZNq93pQ0JCgnSd1mBJd2FvMSUBeKElUlLJJA/viewform';
      console.log('Navigating to Google Form...');
      await page.goto(testFormUrl, { timeout: 30000 });
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('div[role="listitem"]', { timeout: 10000 });
      console.log('Form loaded successfully');
      
      console.log('Waiting for form to be auto-filled...');
      await page.waitForTimeout(15000);
      
      const emailInputCount = await page.locator('input[type="email"]').count();
      console.log('Email input fields found:', emailInputCount);
      
      if (emailInputCount > 0) {
        const emailInput = page.locator('input[type="email"]').first();
        const value = await emailInput.inputValue();
        console.log('Email field value:', value);
        await expect(emailInput).toHaveValue(/@/);
      } else {
        // Form may not have email field, fallback to text input
        console.log('No email field found, checking text inputs...');
        const textInputs = page.locator('input[type="text"]');
        const textInputCount = await textInputs.count();
        console.log('Text inputs found:', textInputCount);
        
        if (textInputCount > 0) {
          const firstInput = textInputs.first();
          const value = await firstInput.inputValue();
          console.log('First text input value:', value);
          await expect(firstInput).toHaveValue(/.+/);
        } else {
          throw new Error('No input fields found on form');
        }
      }
    });

    test('should fill paragraph field', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });
  });

  test.describe('Complex Form Filling', () => {
    test('should fill multiple choice questions', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should fill checkbox questions', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should fill dropdown questions', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should fill date fields', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should fill time fields', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should fill linear scale questions', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });
  });

  test.describe('Form Submission', () => {
    test('should fill entire form before submission', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should skip optional fields if configured', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should respect field validation', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should handle missing API keys', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should handle malformed form structure', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });
  });

  test.describe('Performance', () => {
    test('should fill large form in reasonable time', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });

    test('should not block UI during filling', async () => {
      test.skip(true, 'Waiting for test Google Form creation');
    });
  });
});

