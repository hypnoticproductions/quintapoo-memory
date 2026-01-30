/**
 * AUTOMATED HEADLESS LOGIN - SAVE BROWSER SESSIONS
 * 
 * This script automatically logs in to Twitter, LinkedIn, and Substack
 * using credentials from environment variables, then saves browser sessions
 * for use by automated posting scripts.
 * 
 * Usage:
 *   node scripts/auto_login_sessions.mjs
 * 
 * Required Environment Variables:
 *   - TWITTER_USERNAME
 *   - TWITTER_PASSWORD
 *   - LINKEDIN_EMAIL
 *   - LINKEDIN_PASSWORD
 *   - SUBSTACK_EMAIL
 *   - SUBSTACK_PASSWORD
 */

import { chromium } from 'playwright';

const TWITTER_SESSION_PATH = '/home/ubuntu/.twitter-session.json';
const LINKEDIN_SESSION_PATH = '/home/ubuntu/.linkedin-session.json';
const SUBSTACK_SESSION_PATH = '/home/ubuntu/.substack-session.json';

async function loginToTwitter() {
  console.log('\n' + '='.repeat(60));
  console.log('TWITTER LOGIN');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://twitter.com/i/flow/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Enter username
    const usernameInput = await page.locator('input[autocomplete="username"]').first();
    await usernameInput.fill(process.env.TWITTER_USERNAME);
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Enter password
    const passwordInput = await page.locator('input[name="password"]').first();
    await passwordInput.fill(process.env.TWITTER_PASSWORD);
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);

    // Verify login success
    const url = page.url();
    if (url.includes('/home') || url.includes('/feed')) {
      console.log('✅ Twitter login successful');
      await context.storageState({ path: TWITTER_SESSION_PATH });
      console.log(`✅ Session saved to ${TWITTER_SESSION_PATH}`);
    } else {
      console.error('❌ Twitter login failed - unexpected URL:', url);
    }

  } catch (error) {
    console.error('❌ Twitter login error:', error.message);
  } finally {
    await browser.close();
  }
}

async function loginToLinkedIn() {
  console.log('\n' + '='.repeat(60));
  console.log('LINKEDIN LOGIN');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Enter email
    await page.fill('input[id="username"]', process.env.LINKEDIN_EMAIL);
    await page.waitForTimeout(1000);

    // Enter password
    await page.fill('input[id="password"]', process.env.LINKEDIN_PASSWORD);
    await page.waitForTimeout(1000);

    // Click sign in
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // Verify login success
    const url = page.url();
    if (url.includes('/feed') || url.includes('/mynetwork')) {
      console.log('✅ LinkedIn login successful');
      await context.storageState({ path: LINKEDIN_SESSION_PATH });
      console.log(`✅ Session saved to ${LINKEDIN_SESSION_PATH}`);
    } else {
      console.error('❌ LinkedIn login failed - unexpected URL:', url);
    }

  } catch (error) {
    console.error('❌ LinkedIn login error:', error.message);
  } finally {
    await browser.close();
  }
}

async function loginToSubstack() {
  console.log('\n' + '='.repeat(60));
  console.log('SUBSTACK LOGIN');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://substack.com/sign-in', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Enter email
    await page.fill('input[type="email"]', process.env.SUBSTACK_EMAIL);
    await page.waitForTimeout(1000);

    // Click continue
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);

    // Enter password (if password field appears)
    const passwordField = await page.locator('input[type="password"]').first();
    if (await passwordField.isVisible()) {
      await passwordField.fill(process.env.SUBSTACK_PASSWORD);
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
    }

    // Verify login success
    const url = page.url();
    if (url.includes('/publish') || url.includes('/dashboard')) {
      console.log('✅ Substack login successful');
      await context.storageState({ path: SUBSTACK_SESSION_PATH });
      console.log(`✅ Session saved to ${SUBSTACK_SESSION_PATH}`);
    } else {
      console.error('❌ Substack login failed - unexpected URL:', url);
      console.log('Note: Substack may have sent a magic link to your email. Check your inbox.');
    }

  } catch (error) {
    console.error('❌ Substack login error:', error.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('AUTOMATED BROWSER SESSION LOGIN');
  console.log('='.repeat(60));

  // Validate environment variables
  const required = [
    'TWITTER_USERNAME',
    'TWITTER_PASSWORD',
    'LINKEDIN_EMAIL',
    'LINKEDIN_PASSWORD',
    'SUBSTACK_EMAIL',
    'SUBSTACK_PASSWORD',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nPlease add these to Manus secrets or .env file.');
    process.exit(1);
  }

  try {
    // Login to all platforms
    await loginToTwitter();
    await loginToLinkedIn();
    await loginToSubstack();

    console.log('\n' + '='.repeat(60));
    console.log('✅ SESSION SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log('\nSaved session files:');
    console.log(`  - ${TWITTER_SESSION_PATH}`);
    console.log(`  - ${LINKEDIN_SESSION_PATH}`);
    console.log(`  - ${SUBSTACK_SESSION_PATH}`);
    console.log('\nYou can now run the syndication script:');
    console.log('  node scripts/syndicate_multi_platform.mjs');
    console.log('');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
