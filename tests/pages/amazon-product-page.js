// @ts-check
const { expect } = require('@playwright/test');
const { safeIsVisible } = require('../utils/locator-helpers');
const { PRODUCT_PATH, PURCHASE_STATES, TIMEOUTS } = require('../constants/amazon');

class AmazonProductPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.productTitle = page.locator('#productTitle, #title').first();
    this.addToCartButton = page
      .locator('#add-to-cart-button, input[name="submit.add-to-cart"], button[name="submit.add-to-cart"]')
      .first();
    this.buyNowButton = page
      .locator('#buy-now-button, input[name="submit.buy-now"], button[name="submit.buy-now"]')
      .first();
    this.noFeaturedOffers = page.getByText(/no featured offers available/i).first();
    this.deliveryRestriction = page
      .getByText(/cannot be dispatched to your selected delivery location|choose a different delivery location/i)
      .first();
    this.buyingOptionsLink = page.getByRole('link', { name: /see all buying options|buying options/i }).first();
  }

  isProductUrl() {
    return PRODUCT_PATH.test(this.page.url());
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(PRODUCT_PATH);
    await expect(this.productTitle).toBeVisible();
  }

  async hasDirectPurchaseActions() {
    return this.addToCartButton.or(this.buyNowButton).isVisible().catch(() => false);
  }

  async hasRestrictedAvailabilitySignals() {
    const states = await Promise.all([
      safeIsVisible(this.noFeaturedOffers),
      safeIsVisible(this.deliveryRestriction),
      safeIsVisible(this.buyingOptionsLink),
    ]);

    return states.some(Boolean);
  }

  async getPurchaseState() {
    if (await this.hasDirectPurchaseActions()) {
      return PURCHASE_STATES.PURCHASABLE;
    }

    if (await this.hasRestrictedAvailabilitySignals()) {
      return PURCHASE_STATES.RESTRICTED;
    }

    return PURCHASE_STATES.UNKNOWN;
  }

  async waitForPurchaseState(timeout = TIMEOUTS.PURCHASE_STATE_TIMEOUT) {
    try {
      let state;
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        state = await this.getPurchaseState();
        if (state !== PURCHASE_STATES.UNKNOWN) return state;
        await this.page.waitForTimeout(TIMEOUTS.STATE_POLL);
      }

      return await this.getPurchaseState();
    } catch {
      return PURCHASE_STATES.UNKNOWN;
    }
  }

  async expectPurchaseActions() {
    const state = await this.waitForPurchaseState();
    if (state) return state;

    await expect(this.addToCartButton.or(this.buyNowButton)).toBeVisible();
    return PURCHASE_STATES.PURCHASABLE;
  }

  async expectRestrictedAvailabilitySignals() {
    const state = await this.waitForPurchaseState();
    if (state === PURCHASE_STATES.RESTRICTED) return;

    await expect(this.noFeaturedOffers.or(this.deliveryRestriction)).toBeVisible();
  }

  async dismissAttachUpsell() {
    const noCoverageButton = this.page
      .locator(
        'input[aria-labelledby*="attachSiNoCoverage"], button[aria-labelledby*="attachSiNoCoverage"], #attachSiNoCoverage'
      )
      .first();
    const visible = await safeIsVisible(noCoverageButton);
    if (visible) {
      await noCoverageButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async addToCart() {
    const visible = await safeIsVisible(this.addToCartButton);
    if (!visible) return false;

    await this.addToCartButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.dismissAttachUpsell();
    return true;
  }
}

module.exports = { AmazonProductPage };
