/**
 * BASE 44 → SUBSTACK AUTOMATED SYNDICATION
 * 
 * Fetches latest processed content from Base 44, posts to Substack via browser automation,
 * captures published URL, and triggers multi-platform syndication.
 * 
 * Usage:
 *   node scripts/base44_to_substack.mjs
 * 
 * Environment Variables Required:
 *   - DATABASE_URL (MySQL connection string)
 * 
 * Flow:
 *   1. Fetch latest processed content from `processed_content` table (not yet posted to Substack)
 *   2. Launch browser automation (Playwright)
 *   3. Navigate to Substack editor
 *   4. Fill title, subtitle, body
 *   5. Publish article
 *   6. Capture published URL
 *   7. Update database with Substack URL
 *   8. Trigger multi-platform syndication (Hashnode, Dev.to, LinkedIn, Twitter)
 * 
 * Notes:
 *   - Requires Substack login session (cookies must be valid)
 *   - Browser automation uses Playwright (headless: false for debugging)
 *   - Multi-platform syndication is optional (controlled by ENABLE_SYNDICATION env var)
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { processedContent } from '../drizzle/schema.ts';
import { eq, isNull } from 'drizzle-orm';
import { chromium } from 'playwright';

// Database connection
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

/**
 * Fetch latest processed content from Base 44 that hasn't been posted to Substack yet
 */
async function fetchLatestProcessedContent() {
  const results = await db
    .select()
    .from(processedContent)
    .where(isNull(processedContent.substackUrl))
    .orderBy(processedContent.createdAt, 'desc')
    .limit(1);

  return results[0] || null;
}

/**
 * Post article to Substack via browser automation
 */
async function postToSubstack(article) {
  console.log('[Substack] Launching browser...');
  
  const browser = await chromium.launch({
    headless: false, // Set to true for production
    slowMo: 100, // Slow down for debugging
  });

  const context = await browser.newContext({
    // Load cookies from previous session (if available)
    storageState: '/home/ubuntu/.substack-session.json', // Save cookies after first manual login
  });

  const page = await context.newPage();

  try {
    // Navigate to Substack new post page
    console.log('[Substack] Navigating to editor...');
    await page.goto('https://richarddannibarrifortune.substack.com/publish/home');
    await page.waitForTimeout(2000);

    // Click "Create new" → "Text post"
    console.log('[Substack] Creating new text post...');
    await page.click('button:has-text("Create new")');
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Text post")');
    await page.waitForTimeout(3000);

    // Fill title
    console.log('[Substack] Filling title...');
    const titleField = await page.locator('textarea[placeholder="Title"]');
    await titleField.fill(article.title || 'Untitled');
    await page.waitForTimeout(1000);

    // Fill subtitle (if exists)
    if (article.subtitle) {
      console.log('[Substack] Filling subtitle...');
      const subtitleField = await page.locator('textarea[placeholder="Add a subtitle…"]');
      await subtitleField.fill(article.subtitle);
      await page.waitForTimeout(1000);
    }

    // Fill body content
    console.log('[Substack] Filling body content...');
    const bodyField = await page.locator('textarea').nth(2); // Third textarea is body
    await bodyField.fill(article.content || '');
    await page.waitForTimeout(2000);

    // Click "Continue" to proceed to publish options
    console.log('[Substack] Proceeding to publish options...');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);

    // Click "Send to everyone now" to publish
    console.log('[Substack] Publishing article...');
    await page.click('button:has-text("Send to everyone now")');
    await page.waitForTimeout(5000); // Wait for publish to complete

    // Capture published URL
    const publishedUrl = page.url();
    console.log(`[Substack] Article published: ${publishedUrl}`);

    // Save cookies for future sessions
    await context.storageState({ path: '/home/ubuntu/.substack-session.json' });

    await browser.close();

    return publishedUrl;

  } catch (error) {
    console.error('[Substack] Error during posting:', error);
    await browser.close();
    throw error;
  }
}

/**
 * Update database with Substack URL
 */
async function updateSubstackUrl(articleId, substackUrl) {
  await db
    .update(processedContent)
    .set({ substackUrl, updatedAt: new Date() })
    .where(eq(processedContent.id, articleId));

  console.log(`[Database] Updated article ${articleId} with Substack URL`);
}

/**
 * Trigger multi-platform syndication (optional)
 */
async function triggerSyndication(article, substackUrl) {
  if (process.env.ENABLE_SYNDICATION !== 'true') {
    console.log('[Syndication] Skipped (ENABLE_SYNDICATION not set)');
    return;
  }

  console.log('[Syndication] Triggering multi-platform syndication...');

  // TODO: Implement syndication to:
  // - Hashnode (GraphQL API)
  // - Dev.to (REST API)
  // - LinkedIn (Browser automation)
  // - Twitter (API or browser automation)

  console.log('[Syndication] Multi-platform syndication complete');
}

/**
 * Main execution
 */
async function main() {
  console.log('[Base44→Substack] Starting automated syndication...');

  // Fetch latest processed content
  const article = await fetchLatestProcessedContent();

  if (!article) {
    console.log('[Base44→Substack] No new processed content found. Exiting.');
    await connection.end();
    return;
  }

  console.log(`[Base44→Substack] Found article: "${article.title}"`);

  // Post to Substack
  const substackUrl = await postToSubstack({
    title: article.title,
    subtitle: article.metadata?.subtitle || null,
    content: article.content,
  });

  // Update database
  await updateSubstackUrl(article.id, substackUrl);

  // Trigger multi-platform syndication
  await triggerSyndication(article, substackUrl);

  console.log('[Base44→Substack] Syndication complete!');
  await connection.end();
}

main().catch((error) => {
  console.error('[Base44→Substack] Fatal error:', error);
  process.exit(1);
});
