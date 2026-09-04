// @ts-check
const base = require('@playwright/test');
const { AmazonHeader } = require('../components/amazon-header');
const { AmazonHomePage } = require('../pages/amazon-home-page');
const { AmazonResultsPage } = require('../pages/amazon-results-page');
const { AmazonProductPage } = require('../pages/amazon-product-page');
const { AmazonCartPage } = require('../pages/amazon-cart-page');

/**
 * @typedef {object} AmazonFixtures
 * @property {AmazonHeader} amazonHeader
 * @property {AmazonHomePage} homePage
 * @property {AmazonResultsPage} resultsPage
 * @property {AmazonProductPage} productPage
 * @property {AmazonCartPage} cartPage
 */

/**
 * @type {import('@playwright/test').Fixtures<
 *   AmazonFixtures,
 *   {},
 *   import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions,
 *   import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions
 * >}
 */
const amazonFixtures = {
  amazonHeader: async ({ page }, use) => {
    await use(new AmazonHeader(page));
  },
  homePage: async ({ page, amazonHeader }, use) => {
    await use(new AmazonHomePage(page, amazonHeader));
  },
  resultsPage: async ({ page, amazonHeader }, use) => {
    await use(new AmazonResultsPage(page, amazonHeader));
  },
  productPage: async ({ page }, use) => {
    await use(new AmazonProductPage(page));
  },
  cartPage: async ({ page, amazonHeader }, use) => {
    await use(new AmazonCartPage(page, amazonHeader));
  },

};

const test = base.test.extend(amazonFixtures);

module.exports = {
  test,
  expect: base.expect,
};
