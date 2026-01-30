/**
 * PARALLEL BROWSER LOGIN - SAVE SESSIONS
 * 
 * Opens Twitter, LinkedIn, and Substack in separate browser windows
 * simultaneously. You log in via Google OAuth manually in each window,
 * then press Enter to save each session.
 * 
 * Usage:
 *   node scripts/parallel_login_sessions.mjs
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

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('PARALLEL BROWSER LOGIN');
  console.log('='.repeat(60));
  console.log('\nOpening Twitter, LinkedIn, and Substack...');
  console.log('Log in to each platform via Google OAuth.');
  console.log('Press Enter after all three logins are complete.');
  console.log('='.repeat(60) + '\n');

  // Launch three browsers in parallel
  const twitterBrowser = await chromium.launch({ 
    headless: false,
    args: ['--window-position=0,0', '--window-size=800,900']
  });
  const linkedinBrowser = await chromium.launch({ 
    headless: false,
    args: ['--window-position=820,0', '--window-size=800,900']
  });
  const substackBrowser = await chromium.launch({ 
    headless: false,
    args: ['--window-position=1640,0', '--window-size=800,900']
  });

  const twitterContext = await twitterBrowser.newContext();
  const linkedinContext = await linkedinBrowser.newContext();
  const substackContext = await substackBrowser.newContext();

  const twitterPage = await twitterContext.newPage();
  const linkedinPage = await linkedinContext.newPage();
  const substackPage = await substackContext.newPage();

  // Open login pages
  await Promise.all([
    twitterPage.goto('https://twitter.com/login'),
    linkedinPage.goto('https://www.linkedin.com/login'),
    substackPage.goto('https://substack.com/sign-in'),
  ]);

  console.log('✅ Twitter login page opened (left window)');
  console.log('✅ LinkedIn login page opened (middle window)');
  console.log('✅ Substack login page opened (right window)');

  await askQuestion('\nPress Enter after you have logged in to all three platforms...');

  // Save all sessions
  await twitterContext.storageState({ path: '/home/ubuntu/.twitter-session.json' });
  console.log('✅ Twitter session saved');

  await linkedinContext.storageState({ path: '/home/ubuntu/.linkedin-session.json' });
  console.log('✅ LinkedIn session saved');

  await substackContext.storageState({ path: '/home/ubuntu/.substack-session.json' });
  console.log('✅ Substack session saved');

  // Close browsers
  await twitterBrowser.close();
  await linkedinBrowser.close();
  await substackBrowser.close();

  console.log('\n' + '='.repeat(60));
  console.log('✅ ALL SESSIONS SAVED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log('\nYou can now run the syndication script:');
  console.log('  node scripts/syndicate_multi_platform.mjs\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
