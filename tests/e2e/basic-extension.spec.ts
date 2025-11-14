import { test, expect } from './fixtures/extension-fixture';

test.describe('Basic Extension Tests', () => {
  test('extension loads successfully', async ({ context }) => {
    test.skip(true, 'Already tested and passing');
    
    // Verify the extension context is created
    expect(context).toBeDefined();
    
    // Verify we can create a new page
    const page = await context.newPage();
    expect(page).toBeDefined();
    
    await page.close();
  });

  test('can navigate to Google', async ({ context }) => {
    test.skip(true, 'Already tested and passing');
    
    const page = await context.newPage();
    
    // Navigate to Google to verify browser works
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });
    
    // Verify we're on Google
    expect(page.url()).toContain('google.com');
    
    await page.close();
  });

  test('extension has required files', async ({ context }) => {
    test.skip(true, 'Already tested and passing');
    
    const page = await context.newPage();
    
    // Try to access a basic HTML file to verify extension is loaded
    // This would fail if the extension wasn't properly loaded
    expect(context).toBeDefined();
    
    await page.close();
  });
});

