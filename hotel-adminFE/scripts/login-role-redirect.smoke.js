const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:4200';

async function runRoleCase(browser, testCase) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${FRONTEND_BASE_URL}/login`, { waitUntil: 'networkidle' });

  await page.fill('input[type="email"]', testCase.email);
  await page.fill('input[type="password"]', testCase.password);

  await Promise.all([
    page.waitForURL(`**${testCase.expectedPath}`, { timeout: 15000 }),
    page.getByRole('button', { name: /login/i }).first().click(),
  ]);

  const url = page.url();
  const pathname = new URL(url).pathname;
  assert.equal(
    pathname,
    testCase.expectedPath,
    `${testCase.role} redirect mismatch: expected ${testCase.expectedPath}, got ${pathname}`
  );

  console.log(`PASS ${testCase.role} -> ${pathname}`);
  await context.close();
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  try {
    await runRoleCase(browser, {
      role: 'receptionist',
      email: 'receptionist@example.com',
      password: 'receptionist123',
      expectedPath: '/dashboard',
    });

    await runRoleCase(browser, {
      role: 'manager',
      email: 'manager@example.com',
      password: 'manager123',
      expectedPath: '/manager-dashboard',
    });

    console.log('PASS login role redirect smoke test');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error('FAIL login role redirect smoke test');
  console.error(error);
  process.exit(1);
});
