#!/usr/bin/env node

/**
 * Post to Twitter via Playwright
 * Usage: node post_to_twitter.mjs '["Tweet 1", "Tweet 2", "Tweet 3"]'
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SESSION_DIR = join(__dirname, '..', '.moltbot', 'sessions');

async function postToTwitter(tweets) {
  const browser = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1280, height: 720 },
  });

  const page = await browser.newPage();
  const tweetUrls = [];

  try {
    console.log('[Twitter] Navigating to Twitter...');
    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle' });

    // Check if logged in
    const isLoggedIn = await page.locator('text=Post').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isLoggedIn) {
      console.log('[Twitter] Not logged in. Please log in manually.');
      console.log('[Twitter] Press Enter after logging in...');
      await new Promise(resolve => process.stdin.once('data', resolve));
    }

    // Post each tweet in the thread
    for (let i = 0; i < tweets.length; i++) {
      const tweet = tweets[i];
      console.log(`[Twitter] Posting tweet ${i + 1}/${tweets.length}...`);

      // Find the tweet input field
      const tweetField = page.locator('[data-testid="tweetTextarea_0"]').or(page.locator('div[role="textbox"]').first());
      await tweetField.click();
      await page.waitForTimeout(500);

      // Type tweet content
      await tweetField.fill(tweet);
      await page.waitForTimeout(1000);

      // Click "Post" button
      const postButton = page.locator('[data-testid="tweetButtonInline"]').or(page.locator('text=Post').first());
      await postButton.click();
      await page.waitForTimeout(3000);

      // Get tweet URL from current page (Twitter redirects to tweet after posting)
      const tweetUrl = page.url();
      if (tweetUrl.includes('/status/')) {
        tweetUrls.push(tweetUrl);
        console.log(`[Twitter] Tweet ${i + 1} posted:`, tweetUrl);
      }

      // If this is not the last tweet, click "Reply" to continue thread
      if (i < tweets.length - 1) {
        console.log('[Twitter] Adding reply to thread...');
        await page.click('[data-testid="reply"]');
        await page.waitForTimeout(2000);
      }
    }

    await browser.close();
    
    return {
      success: true,
      urls: tweetUrls,
      count: tweets.length
    };

  } catch (error) {
    console.error('[Twitter] Error:', error.message);
    await browser.close();
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [,, tweetsJson] = process.argv;

  if (!tweetsJson) {
    console.error('Usage: node post_to_twitter.mjs \'["Tweet 1", "Tweet 2", "Tweet 3"]\'');
    process.exit(1);
  }

  let tweets;
  try {
    tweets = JSON.parse(tweetsJson);
  } catch (error) {
    console.error('Error parsing tweets JSON:', error.message);
    process.exit(1);
  }

  if (!Array.isArray(tweets) || tweets.length === 0) {
    console.error('Tweets must be a non-empty array of strings');
    process.exit(1);
  }

  postToTwitter(tweets)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { postToTwitter };
