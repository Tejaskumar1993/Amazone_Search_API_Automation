// @ts-check
const { expect } = require('@playwright/test');

class AmazonHomePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('../components/amazon-header').AmazonHeader} header
   */
  constructor(page, header) {
    this.page = page;
    this.header = header;
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.header.ensureReady();
    console.log('Navigated to Amazon home page');
  }

  async expectLoaded() {
    await expect(this.page).toHaveTitle(/Amazon/i);
    await this.header.expectCoreControls();
    console.log('Amazon home page loaded with core shopping entry points');
  }
}

module.exports = { AmazonHomePage };
