#!/usr/bin/env node

/**
 * Post to Substack via Playwright
 * Usage: node post_to_substack.mjs "Title" "Subtitle" "Body content..."
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SESSION_DIR = join(__dirname, '..', '.moltbot', 'sessions');

async function postToSubstack(title, subtitle, body) {
  const browser = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1280, height: 720 },
  });

  const page = await browser.newPage();

  try {
    console.log('[Substack] Navigating to editor...');
    await page.goto('https://substack.com/publish/post', { waitUntil: 'networkidle' });

    // Check if logged in
    const isLoggedIn = await page.locator('text=Create new').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isLoggedIn) {
      console.log('[Substack] Not logged in. Please log in manually.');
      console.log('[Substack] Press Enter after logging in...');
      await new Promise(resolve => process.stdin.once('data', resolve));
    }

    // Click "Create new" button
    console.log('[Substack] Creating new post...');
    await page.click('text=Create new');
    await page.click('text=Text post');
    await page.waitForTimeout(2000);

    // Fill title
    console.log('[Substack] Filling title...');
    const titleField = page.locator('textarea[placeholder*="Title"]').or(page.locator('input[placeholder*="Title"]'));
    await titleField.fill(title);
    await page.waitForTimeout(500);

    // Fill subtitle
    console.log('[Substack] Filling subtitle...');
    const subtitleField = page.locator('textarea[placeholder*="Subtitle"]').or(page.locator('input[placeholder*="Subtitle"]'));
    await subtitleField.fill(subtitle);
    await page.waitForTimeout(500);

    // Fill body
    console.log('[Substack] Filling body...');
    const bodyField = page.locator('[contenteditable="true"]').first();
    await bodyField.click();
    await page.waitForTimeout(500);
    
    // Type body content (Playwright handles line breaks correctly)
    await bodyField.fill(body);
    await page.waitForTimeout(1000);

    // Click "Continue" to proceed to publish options
    console.log('[Substack] Proceeding to publish options...');
    await page.click('text=Continue');
    await page.waitForTimeout(2000);

    // Save as draft (click "Cancel" instead of "Send to everyone now")
    console.log('[Substack] Saving as draft...');
    await page.click('text=Cancel');
    await page.waitForTimeout(2000);

    // Get draft URL from current page
    const draftUrl = page.url();
    console.log('[Substack] Draft saved:', draftUrl);

    await browser.close();
    
    return {
      success: true,
      url: draftUrl,
      status: 'draft'
    };

  } catch (error) {
    console.error('[Substack] Error:', error.message);
    await browser.close();
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [,, title, subtitle, body] = process.argv;

  if (!title || !subtitle || !body) {
    console.error('Usage: node post_to_substack.mjs "Title" "Subtitle" "Body content..."');
    process.exit(1);
  }

  postToSubstack(title, subtitle, body)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { postToSubstack };
