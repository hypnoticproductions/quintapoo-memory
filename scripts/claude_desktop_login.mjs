/**
 * CLAUDE DESKTOP LOGIN SCRIPT
 * 
 * One-time setup: Log in to Substack and Twitter to save browser sessions
 * Run this script via Claude Desktop with local browser access
 * 
 * Usage:
 *   node scripts/claude_desktop_login.mjs
 * 
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function loginToSubstack() {
  console.log('\n' + '='.repeat(60));
  console.log('SUBSTACK LOGIN');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://substack.com/sign-in');
  console.log('\n✅ Substack login page opened.');
  console.log('📝 Please log in to Substack via Google OAuth.');

  await askQuestion('\nPress Enter after you have logged in to Substack...');

  // Save session
  const sessionPath = path.join(__dirname, '..', '.substack-session.json');
  await context.storageState({ path: sessionPath });
  console.log(`✅ Substack session saved to ${sessionPath}`);

  await browser.close();
}

async function loginToTwitter() {
  console.log('\n' + '='.repeat(60));
  console.log('TWITTER LOGIN');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://twitter.com/login');
  console.log('\n✅ Twitter login page opened.');
  console.log('📝 Please log in to Twitter via Google OAuth.');

  await askQuestion('\nPress Enter after you have logged in to Twitter...');

  // Save session
  const sessionPath = path.join(__dirname, '..', '.twitter-session.json');
  await context.storageState({ path: sessionPath });
  console.log(`✅ Twitter session saved to ${sessionPath}`);

  await browser.close();
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('CLAUDE DESKTOP LOGIN SETUP');
  console.log('='.repeat(60));
  console.log('\nThis script will open browser windows for Substack and Twitter.');
  console.log('Log in to each platform via Google OAuth, then press Enter.');
  console.log('\n' + '='.repeat(60));

  try {
    // Login to Substack
    await loginToSubstack();

    // Login to Twitter
    await loginToTwitter();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL SESSIONS SAVED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\nYou can now run the posting script:');
    console.log('  node scripts/claude_desktop_post.mjs\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main();
