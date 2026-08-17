// @ts-check
const { expect } = require('@playwright/test');
const { safeIsVisible } = require('../utils/locator-helpers');
const { TIMEOUTS, I18N_STRINGS, AMAZON_DE_URL_PATTERN } = require('../constants/amazon');

const SEARCH_BOX_SELECTOR = [
  '#twotabsearchtextbox:visible',
  'input[name="field-keywords"]:not([type="hidden"]):visible',
  'input[type="search"]:visible',
  'input[aria-label*="suche" i]:visible',
  'input[aria-label*="search" i]:visible',
].join(', ');

class AmazonHeader {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.searchBox = page.locator(SEARCH_BOX_SELECTOR).first();
    this.logo = page
      .locator('#nav-logo:visible, #navbar-logo:visible, a[aria-label*="Amazon" i]:visible')
      .first();
    this.searchButton = page
      .locator('#nav-search-submit-button:visible, input[type="submit"][value*="Go" i]:visible')
      .first();
    this.cart = page.locator('#nav-cart:visible, a[href*="/cart"]:visible').first();
    this.cartCount = page.locator('#nav-cart-count').first();
  }

  async resolveInterstitials() {
    const cookieAcceptButton = this.page
      .locator('#sp-cc-accept, input[name="accept"], button:has-text("Alle akzeptieren"), button:has-text("Accept")')
      .first();
    const continueShoppingButton = this.page.getByRole('button', {
      name: new RegExp(I18N_STRINGS.CONTINUE_SHOPPING.de + '|' + I18N_STRINGS.CONTINUE_SHOPPING.en, 'i'),
    });
    const backToHomepage = this.page.getByRole('link', {
      name: new RegExp(
        I18N_STRINGS.BACK_TO_HOME.de + '|' + I18N_STRINGS.BACK_TO_HOME.en,
        'i'
      ),
    });

    const [cookieVisible, continueVisible, backVisible] = await Promise.all([
      safeIsVisible(cookieAcceptButton),
      safeIsVisible(continueShoppingButton),
      safeIsVisible(backToHomepage),
    ]);

    if (cookieVisible) {
      await cookieAcceptButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    }

    if (continueVisible) {
      await continueShoppingButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    }

    if (backVisible) {
      await backToHomepage.click();
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    }

    return false;
  }

  async ensureReady() {
    try {
      await this.searchBox.waitFor({ state: 'visible', timeout: TIMEOUTS.DOM_READY_TIMEOUT });
      await this.resolveInterstitials();
      await this.searchBox.waitFor({ state: 'visible', timeout: TIMEOUTS.DOM_READY_TIMEOUT });
      return;
    } catch {
      // Search box not visible, try to resolve interstitials
    }

    const handled = await this.resolveInterstitials();
    if (!handled) {
      await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    }

    await this.searchBox.waitFor({ state: 'visible', timeout: TIMEOUTS.DOM_READY_TIMEOUT });
  }

  async search(query) {
    await this.ensureReady();
    await this.setSearchQuery(query);
    await this.submitSearchWithWait(() => this.searchBox.press('Enter'));
  }

  async searchWithButton(query) {
    await this.ensureReady();
    await this.setSearchQuery(query);
    await expect(this.searchButton).toBeVisible();
    await this.submitSearchWithWait(() => this.searchButton.click());
  }

  async submitCurrentSearch() {
    await this.ensureReady();
    await this.submitSearchWithWait(() => this.searchBox.press('Enter'));
  }

  async submitSearchWithWait(submitAction) {
    const currentUrl = this.page.url();
    const navigation = this.page
      .waitForURL((url) => url.toString() !== currentUrl, {
        timeout: TIMEOUTS.DOM_READY_TIMEOUT,
      })
      .then(() => this.page.waitForLoadState('domcontentloaded', {
        timeout: TIMEOUTS.DOM_READY_TIMEOUT,
      }))
      .catch((error) => {
        if (this.page.isClosed()) throw error;
        if (/Timeout/i.test(error.message || '')) return;
        throw error;
      });

    await Promise.all([navigation, submitAction()]);
  }

  async setSearchQuery(query) {
    await this.clearSearch();
    await this.searchBox.fill(query);
    await expect(this.searchBox).toHaveValue(query);
  }

  async clearSearch() {
    await this.ensureReady();
    await this.searchBox.click();
    await this.searchBox.selectText();
    await this.searchBox.press('Delete');

    if ((await this.searchBox.inputValue().catch(() => '')) !== '') {
      await this.searchBox.fill('');
    }
  }

  async expectCoreControls() {
    await expect(this.searchBox).toBeVisible();
    await expect(this.logo).toBeVisible();
    await expect(this.cart).toBeVisible();
  }

  async goToCart() {
    await expect(this.cart).toBeVisible();
    await this.cart.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goHomeFromLogo() {
    await expect(this.logo).toBeVisible();
    await this.logo.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = { AmazonHeader };
