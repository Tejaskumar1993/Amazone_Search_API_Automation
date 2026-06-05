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
  }

  async expectLoaded() {
    await expect(this.page).toHaveTitle(/Amazon/i);
    await this.header.expectCoreControls();
  }
}

module.exports = { AmazonHomePage };
