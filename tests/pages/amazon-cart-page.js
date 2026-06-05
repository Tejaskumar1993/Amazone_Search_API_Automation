// @ts-check
const { expect } = require('@playwright/test');
const { AMAZON_DE_URL_PATTERN, I18N_STRINGS } = require('../constants/amazon');

class AmazonCartPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('../components/amazon-header').AmazonHeader} header
   */
  constructor(page, header) {
    this.page = page;
    this.header = header;
    this.cartHeading = page.getByRole('heading', {
      name: new RegExp(
        I18N_STRINGS.CART_HEADING.de +
          '|' +
          I18N_STRINGS.CART_HEADING.en +
          '|' +
          I18N_STRINGS.CART_HEADING.alt_en,
        'i'
      ),
    });
    this.addedConfirmation = page
      .locator('#NATC_SMART_WAGON_CONF_MSG_SUCCESS, #sw-atc-details-single-container')
      .first();
    this.signInHeading = page.getByRole('heading', { name: /anmelden|sign in/i });
  }

  async expectCartFlowSignals() {
    await expect(this.page).toHaveURL(AMAZON_DE_URL_PATTERN);
    await expect(
      this.header.cartCount.or(this.cartHeading).or(this.addedConfirmation).or(this.signInHeading)
    ).toBeVisible();
  }
}

module.exports = { AmazonCartPage };
