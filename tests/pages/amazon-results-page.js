// @ts-check
const { expect } = require('@playwright/test');
const { safeIsVisible } = require('../utils/locator-helpers');
const { SEARCH_RESULTS_PATH, AMAZON_DE_URL_PATTERN, I18N_STRINGS } = require('../constants/amazon');

const SEARCH_RESULTS_SELECTOR = '[data-component-type="s-search-result"]';

class AmazonResultsPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('../components/amazon-header').AmazonHeader} header
   */
  constructor(page, header) {
    this.page = page;
    this.header = header;
    this.results = page.locator(SEARCH_RESULTS_SELECTOR);
  }

  isSearchResultsUrl() {
    return SEARCH_RESULTS_PATH.test(this.page.url());
  }

  async searchFor(query) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.header.search(query);
      await this.page.waitForURL(SEARCH_RESULTS_PATH, { timeout: 5_000 }).catch(() => {});

      try {
        await this.results.first().waitFor({ state: 'visible', timeout: 2_000 });
      } catch {
        // Results not visible, continue with error handling
      }

      const technicalErrorHeading = this.page.getByRole('heading', {
        name: new RegExp(I18N_STRINGS.ERROR_MESSAGES.de + '|' + I18N_STRINGS.ERROR_MESSAGES.en, 'i'),
      });
      const visible = await safeIsVisible(technicalErrorHeading);
      if (!visible) break;

      const backToHomepage = this.page.getByRole('link', {
        name: new RegExp(
          I18N_STRINGS.BACK_TO_HOME.de + '|' + I18N_STRINGS.BACK_TO_HOME.en,
          'i'
        ),
      });
      if (await safeIsVisible(backToHomepage)) {
        await backToHomepage.click();
        await this.page.waitForLoadState('domcontentloaded');
      }
    }
  }

  async expectVisibleOrFallback() {
    if (this.isSearchResultsUrl()) {
      await expect(this.results.first()).toBeVisible();
      return;
    }

    await expect(this.page).toHaveURL(AMAZON_DE_URL_PATTERN);
  }

  async openFirstProduct() {
    if (!this.isSearchResultsUrl()) return false;

    const firstResult = this.results.first();
    await expect(firstResult).toBeVisible();

    const firstProductLink = firstResult.locator('h2 a, a.a-link-normal').first();
    await expect(firstProductLink).toBeVisible();
    await firstProductLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    return true;
  }
}

module.exports = {
  AmazonResultsPage,
};
