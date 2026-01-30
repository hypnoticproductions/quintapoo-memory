/**
 * MANUAL LOGIN SCRIPT - SAVE BROWSER SESSIONS
 * 
 * This script opens Twitter, LinkedIn, and Substack in a browser window
 * and waits for you to log in manually. Once logged in, it saves the
 * browser session cookies so automated posting scripts can use them.
 * 
 * Usage:
 *   node scripts/save_browser_sessions.mjs
 * 
 * Instructions:
 *   1. Run this script
 *   2. Browser windows will open for each platform
 *   3. Log in manually to each platform
 *   4. Press Enter in the terminal after logging in to each platform
 *   5. Script will save session cookies and close
 */

import { chromium } from 'playwright';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function saveTwitterSession() {
  console.log('\n' + '='.repeat(60));
  console.log('TWITTER LOGIN');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://twitter.com/login');
  console.log('\n✅ Twitter login page opened.');
  console.log('📝 Please log in to Twitter in the browser window.');

  await askQuestion('\nPress Enter after you have logged in to Twitter...');

  // Save session
  await context.storageState({ path: '/home/ubuntu/.twitter-session.json' });
  console.log('✅ Twitter session saved to /home/ubuntu/.twitter-session.json');

  await browser.close();
}

async function saveLinkedInSession() {
  console.log('\n' + '='.repeat(60));
  console.log('LINKEDIN LOGIN');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login');
  console.log('\n✅ LinkedIn login page opened.');
  console.log('📝 Please log in to LinkedIn in the browser window.');

  await askQuestion('\nPress Enter after you have logged in to LinkedIn...');

  // Save session
  await context.storageState({ path: '/home/ubuntu/.linkedin-session.json' });
  console.log('✅ LinkedIn session saved to /home/ubuntu/.linkedin-session.json');

  await browser.close();
}

async function saveSubstackSession() {
  console.log('\n' + '='.repeat(60));
  console.log('SUBSTACK LOGIN');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://substack.com/sign-in');
  console.log('\n✅ Substack login page opened.');
  console.log('📝 Please log in to Substack in the browser window.');

  await askQuestion('\nPress Enter after you have logged in to Substack...');

  // Save session
  await context.storageState({ path: '/home/ubuntu/.substack-session.json' });
  console.log('✅ Substack session saved to /home/ubuntu/.substack-session.json');

  await browser.close();
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('BROWSER SESSION SAVER');
  console.log('='.repeat(60));
  console.log('\nThis script will open browser windows for Twitter, LinkedIn,');
  console.log('and Substack. Log in to each platform manually, then press Enter');
  console.log('in the terminal to save the session cookies.');
  console.log('\n' + '='.repeat(60));

  try {
    // Save Twitter session
    await saveTwitterSession();

    // Save LinkedIn session
    await saveLinkedInSession();

    // Save Substack session
    await saveSubstackSession();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL SESSIONS SAVED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\nSaved session files:');
    console.log('  - /home/ubuntu/.twitter-session.json');
    console.log('  - /home/ubuntu/.linkedin-session.json');
    console.log('  - /home/ubuntu/.substack-session.json');
    console.log('\nYou can now run the syndication script:');
    console.log('  node scripts/syndicate_multi_platform.mjs');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main();
