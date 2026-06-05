// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { chromium } = require('@playwright/test');

const authFile = process.env.AMAZON_STORAGE_STATE || path.resolve(__dirname, '../../playwright/.auth/amazon.de.json');

async function main() {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ baseURL: 'https://www.amazon.de/' });
  const page = await context.newPage();

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  console.log('Sign in to Amazon.de in the opened browser window.');
  console.log('After the account page/header shows you are signed in, return here and press Enter.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await rl.question('');
  rl.close();

  await context.storageState({ path: authFile });
  await browser.close();

  console.log(`Saved Amazon login session to ${authFile}`);
  console.log('Future Playwright runs will reuse this session and will not log out.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
