/**
 * CLAUDE DESKTOP POSTING SCRIPT
 * 
 * Posts Caribbean tourism content to Substack + Twitter
 * Designed to run via Claude Desktop with local browser access
 * 
 * Usage:
 *   node scripts/claude_desktop_post.mjs
 * 
 * Prerequisites:
 *   1. Run claude_desktop_login.mjs first (one-time setup)
 *   2. Ensure Playwright is installed: npm install playwright
 *   3. Ensure browsers are installed: npx playwright install chromium
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session file paths
const SUBSTACK_SESSION = path.join(__dirname, '..', '.substack-session.json');
const TWITTER_SESSION = path.join(__dirname, '..', '.twitter-session.json');

// Content file path
const CONTENT_FILE = path.join(__dirname, '..', 'content', 'daily_posts_caribbean_tourism.md');

// Posting history file
const HISTORY_FILE = path.join(__dirname, '..', '.posting-history.json');

// Load posting history
function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
  }
  return { lastPosted: 0, totalPosts: 0 };
}

// Save posting history
function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Parse content file and extract posts
function loadPosts() {
  const content = fs.readFileSync(CONTENT_FILE, 'utf-8');
  
  const posts = [];
  const postRegex = /## POST (\d+): (.+?)\n\n\*\*Substack Version.*?\n\n### (.+?)\n\n([\s\S]+?)\n\n---\n\n\*\*Twitter Version.*?\n\n([\s\S]+?)\n\n---/g;
  
  let match;
  while ((match = postRegex.exec(content)) !== null) {
    posts.push({
      id: parseInt(match[1]),
      shortTitle: match[2],
      title: match[3],
      substackContent: match[4].trim(),
      twitterContent: match[5].trim(),
    });
  }
  
  return posts;
}

// Post to Substack
async function postToSubstack(post) {
  console.log('\n' + '='.repeat(60));
  console.log(`POSTING TO SUBSTACK: ${post.shortTitle}`);
  console.log('='.repeat(60));

  if (!fs.existsSync(SUBSTACK_SESSION)) {
    console.error('❌ Substack session not found. Run claude_desktop_login.mjs first.');
    return false;
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: SUBSTACK_SESSION });
  const page = await context.newPage();

  try {
    // Navigate to new post page
    await page.goto('https://substack.com/publish/post', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Fill title
    const titleField = await page.locator('textarea[placeholder*="Title"]').first();
    await titleField.fill(post.title);
    await page.waitForTimeout(1000);

    // Fill content
    const bodyField = await page.locator('[contenteditable="true"]').last();
    await bodyField.click();
    await page.waitForTimeout(500);
    await bodyField.fill(post.substackContent);
    await page.waitForTimeout(2000);

    // Click "Continue" to save as draft
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);

    // Save as draft (click Cancel on publish dialog)
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(2000);

    console.log('✅ Posted to Substack (saved as draft)');
    return true;

  } catch (error) {
    console.error('❌ Substack posting error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Post to Twitter
async function postToTwitter(post) {
  console.log('\n' + '='.repeat(60));
  console.log(`POSTING TO TWITTER: ${post.shortTitle}`);
  console.log('='.repeat(60));

  if (!fs.existsSync(TWITTER_SESSION)) {
    console.error('❌ Twitter session not found. Run claude_desktop_login.mjs first.');
    return false;
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: TWITTER_SESSION });
  const page = await context.newPage();

  try {
    // Navigate to Twitter
    await page.goto('https://twitter.com/compose/tweet', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Fill tweet content
    const tweetBox = await page.locator('[data-testid="tweetTextarea_0"]').first();
    await tweetBox.fill(post.twitterContent);
    await page.waitForTimeout(2000);

    // Click "Post" button
    await page.click('[data-testid="tweetButtonInline"]');
    await page.waitForTimeout(5000);

    console.log('✅ Posted to Twitter');
    return true;

  } catch (error) {
    console.error('❌ Twitter posting error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Main execution
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('CARIBBEAN TOURISM POSTING SCRIPT');
  console.log('='.repeat(60));

  // Load posts
  const posts = loadPosts();
  console.log(`\n✅ Loaded ${posts.length} posts from content file`);

  // Load history
  const history = loadHistory();
  console.log(`✅ Last posted: Post ${history.lastPosted}, Total posts: ${history.totalPosts}`);

  // Determine which post to publish next (rotate through 1-6)
  const nextPostIndex = history.lastPosted % 6;
  const nextPost = posts[nextPostIndex];

  console.log(`\n📝 Next post: Post ${nextPost.id} - ${nextPost.shortTitle}`);

  // Post to Substack
  const substackSuccess = await postToSubstack(nextPost);

  // Post to Twitter
  const twitterSuccess = await postToTwitter(nextPost);

  // Update history
  if (substackSuccess || twitterSuccess) {
    history.lastPosted = nextPost.id;
    history.totalPosts += 1;
    saveHistory(history);
  }

  // Report results
  console.log('\n' + '='.repeat(60));
  console.log('POSTING COMPLETE');
  console.log('='.repeat(60));
  console.log(`Substack: ${substackSuccess ? '✅ Success' : '❌ Failed'}`);
  console.log(`Twitter: ${twitterSuccess ? '✅ Success' : '❌ Failed'}`);
  console.log(`Next post will be: Post ${(nextPost.id % 6) + 1}`);
  console.log('');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
