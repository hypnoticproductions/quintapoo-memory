/**
 * MULTI-PLATFORM SYNDICATION ENGINE
 * 
 * Distributes content to: Substack → Twitter → LinkedIn → Hashnode → Dev.to
 * 
 * Usage:
 *   node scripts/syndicate_multi_platform.mjs
 * 
 * Environment Variables:
 *   - HASHNODE_API_TOKEN
 *   - HASHNODE_PUBLICATION_ID
 *   - DEVTO_API_KEY
 *   - ENABLE_SYNDICATION (set to "true" to enable)
 */

import { chromium } from 'playwright';
import fetch from 'node-fetch';
import { db } from '../server/db.js';
import { processedContent } from '../drizzle/schema.js';
import { desc } from 'drizzle-orm';

// ========================================
// CONFIGURATION
// ========================================

const ENABLE_SYNDICATION = process.env.ENABLE_SYNDICATION === 'true';
const SUBSTACK_SESSION_PATH = '/home/ubuntu/.substack-session.json';
const TWITTER_SESSION_PATH = '/home/ubuntu/.twitter-session.json';
const LINKEDIN_SESSION_PATH = '/home/ubuntu/.linkedin-session.json';

// ========================================
// SUBSTACK POSTING (Playwright)
// ========================================

async function postToSubstack(title, subtitle, bodyMarkdown) {
  console.log('[Substack] Launching browser...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: SUBSTACK_SESSION_PATH,
  });
  const page = await context.newPage();

  try {
    await page.goto('https://substack.com/publish/post');
    await page.waitForTimeout(3000);

    // Click "Create new" → "Text post"
    await page.click('button:has-text("Create new")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Text post")');
    await page.waitForTimeout(2000);

    // Fill title
    await page.fill('input[placeholder="Post title"]', title);
    await page.waitForTimeout(1000);

    // Fill subtitle
    await page.fill('input[placeholder="Subtitle (optional)"]', subtitle);
    await page.waitForTimeout(1000);

    // Fill body
    const editor = await page.locator('div[contenteditable="true"]').first();
    await editor.click();
    await page.waitForTimeout(1000);
    await editor.fill(bodyMarkdown);
    await page.waitForTimeout(2000);

    // Click "Continue" to save as draft
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);

    // Click "Cancel" to save as draft (not publish)
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(2000);

    // Get draft URL
    const url = page.url();
    console.log(`[Substack] Draft saved: ${url}`);

    await context.storageState({ path: SUBSTACK_SESSION_PATH });
    await browser.close();

    return { success: true, url };

  } catch (error) {
    console.error('[Substack] Error:', error);
    await browser.close();
    throw error;
  }
}

// ========================================
// TWITTER POSTING (Playwright)
// ========================================

async function postToTwitter(content) {
  console.log('[Twitter] Launching browser...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: TWITTER_SESSION_PATH,
  });
  const page = await context.newPage();

  try {
    await page.goto('https://twitter.com/compose/tweet');
    await page.waitForTimeout(3000);

    // Type tweet
    const editor = await page.locator('div[contenteditable="true"]').first();
    await editor.click();
    await page.waitForTimeout(1000);
    await editor.fill(content);
    await page.waitForTimeout(2000);

    // Click "Post" button
    await page.click('button[data-testid="tweetButtonInline"]');
    await page.waitForTimeout(5000);

    // Get tweet URL
    const url = page.url();
    console.log(`[Twitter] Posted: ${url}`);

    await context.storageState({ path: TWITTER_SESSION_PATH });
    await browser.close();

    return { success: true, url };

  } catch (error) {
    console.error('[Twitter] Error:', error);
    await browser.close();
    throw error;
  }
}

// ========================================
// LINKEDIN POSTING (Playwright)
// ========================================

async function postToLinkedIn(content) {
  console.log('[LinkedIn] Launching browser...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: LINKEDIN_SESSION_PATH,
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.linkedin.com/feed/');
    await page.waitForTimeout(3000);

    // Click "Start a post"
    await page.click('button[aria-label="Start a post"]');
    await page.waitForTimeout(2000);

    // Type post
    const editor = await page.locator('div[data-placeholder="What do you want to talk about?"]');
    await editor.click();
    await page.waitForTimeout(1000);
    await editor.fill(content);
    await page.waitForTimeout(2000);

    // Click "Post"
    await page.click('button[aria-label="Post"]');
    await page.waitForTimeout(5000);

    const url = page.url();
    console.log(`[LinkedIn] Posted: ${url}`);

    await context.storageState({ path: LINKEDIN_SESSION_PATH });
    await browser.close();

    return { success: true, url };

  } catch (error) {
    console.error('[LinkedIn] Error:', error);
    await browser.close();
    throw error;
  }
}

// ========================================
// HASHNODE POSTING (GraphQL API)
// ========================================

async function postToHashnode(title, contentMarkdown, tags) {
  console.log('[Hashnode] Posting via GraphQL API...');

  const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          slug
          url
          title
        }
      }
    }
  `;

  const variables = {
    input: {
      title,
      contentMarkdown,
      publicationId: process.env.HASHNODE_PUBLICATION_ID,
      tags: tags.map(tag => ({ slug: tag })),
    },
  };

  const response = await fetch('https://gql.hashnode.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.HASHNODE_API_TOKEN,
    },
    body: JSON.stringify({
      query: mutation,
      variables,
    }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Hashnode API error: ${JSON.stringify(data.errors)}`);
  }

  const post = data.data.publishPost.post;
  console.log(`[Hashnode] Posted: ${post.url}`);

  return post;
}

// ========================================
// DEV.TO POSTING (REST API)
// ========================================

async function postToDevTo(title, bodyMarkdown, tags, canonicalUrl) {
  console.log('[Dev.to] Posting via REST API...');

  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DEVTO_API_KEY,
    },
    body: JSON.stringify({
      article: {
        title,
        body_markdown: bodyMarkdown,
        published: true,
        tags,
        canonical_url: canonicalUrl || null,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dev.to API error: ${error}`);
  }

  const article = await response.json();
  console.log(`[Dev.to] Posted: ${article.url}`);

  return article;
}

// ========================================
// MAIN SYNDICATION WORKFLOW
// ========================================

async function syndicateLatestArticle() {
  console.log('='.repeat(60));
  console.log('MULTI-PLATFORM SYNDICATION ENGINE');
  console.log('='.repeat(60));

  if (!ENABLE_SYNDICATION) {
    console.log('⚠️  Syndication is DISABLED. Set ENABLE_SYNDICATION=true to activate.');
    return;
  }

  // Fetch latest processed content from Base 44
  const [latestArticle] = await db
    .select()
    .from(processedContent)
    .orderBy(desc(processedContent.createdAt))
    .limit(1);

  if (!latestArticle) {
    console.log('❌ No articles found in processed_content table.');
    return;
  }

  console.log(`\n📄 Article: "${latestArticle.title}"`);
  console.log(`📅 Created: ${latestArticle.createdAt}`);
  console.log('');

  const results = {
    substack: null,
    twitter: null,
    linkedin: null,
    hashnode: null,
    devto: null,
  };

  // 1. POST TO SUBSTACK (Primary)
  try {
    results.substack = await postToSubstack(
      latestArticle.title,
      latestArticle.subtitle || '',
      latestArticle.content
    );
  } catch (error) {
    console.error('❌ Substack failed:', error.message);
  }

  // 2. POST TO TWITTER (280 chars max)
  try {
    const twitterContent = `🚨 ${latestArticle.title}

${latestArticle.content.substring(0, 150)}...

Read more: ${results.substack?.url || 'dopa.buzz'}

#Caribbean #AI #Tourism`;

    results.twitter = await postToTwitter(twitterContent);
  } catch (error) {
    console.error('❌ Twitter failed:', error.message);
  }

  // 3. POST TO LINKEDIN (3000 chars max)
  try {
    const linkedInContent = `${latestArticle.title}

${latestArticle.content}

Read full article: ${results.substack?.url || 'dopa.buzz'}

#Caribbean #AI #Tourism #Hospitality`;

    results.linkedin = await postToLinkedIn(linkedInContent);
  } catch (error) {
    console.error('❌ LinkedIn failed:', error.message);
  }

  // 4. POST TO HASHNODE (GraphQL API)
  try {
    const hashnodeMarkdown = `${latestArticle.content}

---

*Read full article: [${latestArticle.title}](${results.substack?.url || 'https://dopa.buzz'})*

*Analysis by WUKR Wire*`;

    results.hashnode = await postToHashnode(
      latestArticle.title,
      hashnodeMarkdown,
      ['caribbean', 'ai', 'tourism', 'hospitality']
    );
  } catch (error) {
    console.error('❌ Hashnode failed:', error.message);
  }

  // 5. POST TO DEV.TO (REST API)
  try {
    const devToMarkdown = `${latestArticle.content}

## Key Points

- Language barriers cost Caribbean hotels millions
- AI voice agents can handle multilingual bookings 24/7
- Sally WUKR is built specifically for Caribbean tourism

---

*Read full article: [${latestArticle.title}](${results.substack?.url || 'https://dopa.buzz'})*

*Analysis by WUKR Wire*`;

    results.devto = await postToDevTo(
      latestArticle.title,
      devToMarkdown,
      ['caribbean', 'ai', 'tourism', 'hospitality'],
      results.substack?.url
    );
  } catch (error) {
    console.error('❌ Dev.to failed:', error.message);
  }

  // SUMMARY
  console.log('');
  console.log('='.repeat(60));
  console.log('SYNDICATION RESULTS');
  console.log('='.repeat(60));
  console.log(`Substack: ${results.substack ? '✅ ' + results.substack.url : '❌ Failed'}`);
  console.log(`Twitter: ${results.twitter ? '✅ ' + results.twitter.url : '❌ Failed'}`);
  console.log(`LinkedIn: ${results.linkedin ? '✅ ' + results.linkedin.url : '❌ Failed'}`);
  console.log(`Hashnode: ${results.hashnode ? '✅ ' + results.hashnode.url : '❌ Failed'}`);
  console.log(`Dev.to: ${results.devto ? '✅ ' + results.devto.url : '❌ Failed'}`);
  console.log('='.repeat(60));
}

// Run syndication
syndicateLatestArticle().catch(console.error);
