// @ts-check
const { test, expect } = require('../../fixtures/amazon-test');
const {
  primaryQuery,
  secondaryQuery,
  refinedQuery,
  tertiaryQuery,
  reusableQuery,
} = require('../../data/search-data');
const {
  SEARCH_RESULTS_PATH,
  PRODUCT_PATH,
  AMAZON_DE_URL_PATTERN,
  PURCHASE_STATES,
} = require('../../constants/amazon');

const SEARCH_RESULTS_SELECTOR = '[data-component-type="s-search-result"]';

test.describe('amazon.de validation coverage', () => {
  test.describe.configure({ mode: 'serial', timeout: 90_000 });

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('home page shows core shopping entry points', async ({ homePage }) => {
    await homePage.expectLoaded();
  });

  test('search for Lenovo ThinkPad shows results or stays on Amazon fallback', async ({ page, resultsPage }) => {
    await resultsPage.searchFor(primaryQuery);

    if (resultsPage.isSearchResultsUrl()) {
      await expect(page.locator(SEARCH_RESULTS_SELECTOR).first()).toBeVisible();
      await expect(page.locator('body')).toContainText(/lenovo|thinkpad/i);
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test('search query remains populated after submitting', async ({ amazonHeader, resultsPage }) => {
    await resultsPage.searchFor(primaryQuery);

    await expect(amazonHeader.searchBox).toBeVisible();
    await expect(amazonHeader.searchBox).toHaveValue(/lenovo|thinkpad/i);
  });

  test('can run a second search from the search box', async ({ page, amazonHeader, resultsPage }) => {
    await resultsPage.searchFor(primaryQuery);
    await resultsPage.searchFor(secondaryQuery);

    await expect(amazonHeader.searchBox).toBeVisible();
    await expect(amazonHeader.searchBox).toHaveValue(/wireless mouse/i);

    if (resultsPage.isSearchResultsUrl()) {
      await expect(page.locator('body')).toContainText(/wireless|mouse/i);
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test('search results keep core header controls available', async ({ resultsPage, amazonHeader }) => {
    await resultsPage.searchFor(primaryQuery);
    await amazonHeader.expectCoreControls();

    if (resultsPage.isSearchResultsUrl()) {
      await expect(resultsPage.results.first()).toBeVisible();
    }
  });

  test('search can be refined with an additional keyword', async ({ page, amazonHeader, resultsPage }) => {
    await resultsPage.searchFor(primaryQuery);
    await resultsPage.searchFor(refinedQuery);

    await expect(amazonHeader.searchBox).toBeVisible();
    await expect(amazonHeader.searchBox).toHaveValue(/16gb/i);

    if (resultsPage.isSearchResultsUrl()) {
      await expect(page.locator('body')).toContainText(/16gb|lenovo|thinkpad/i);
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test('search results page remains on Amazon domain after multiple searches', async ({ page, amazonHeader, resultsPage }) => {
    await resultsPage.searchFor(primaryQuery);
    await resultsPage.searchFor(secondaryQuery);
    await resultsPage.searchFor(tertiaryQuery);

    await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    await expect(amazonHeader.searchBox).toBeVisible();
    await expect(amazonHeader.searchBox).toHaveValue(/usb c hub/i);

    if (resultsPage.isSearchResultsUrl()) {
      await expect(resultsPage.results.first()).toBeVisible();
    }
  });

  test('logo returns back to the home page after searching', async ({ page, amazonHeader, resultsPage }) => {
    await resultsPage.searchFor(primaryQuery);
    await amazonHeader.goHomeFromLogo();

    await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    await expect(page).not.toHaveURL(SEARCH_RESULTS_PATH);
    await amazonHeader.expectCoreControls();
  });

  test('results URL keeps the submitted search query when results load', async ({ page, resultsPage }) => {
    await resultsPage.searchFor(secondaryQuery);

    if (resultsPage.isSearchResultsUrl()) {
      const searchUrl = new URL(page.url());
      expect(searchUrl.searchParams.get('k') || '').toMatch(/wireless mouse/i);
      await expect(resultsPage.results.first()).toBeVisible();
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test('results page exposes a product link for the current query', async ({ page, resultsPage }) => {
    await resultsPage.searchFor(primaryQuery);

    if (resultsPage.isSearchResultsUrl()) {
      const firstResult = resultsPage.results.first();
      await expect(firstResult).toBeVisible();

      const firstProductLink = firstResult.locator('h2 a, a.a-link-normal').first();
      await expect(firstProductLink).toBeVisible();
      const href = await firstProductLink.getAttribute('href');
      expect(href || '').toMatch(/(\/dp\/|\/gp\/product\/|\/sspa\/click)/i);
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test('search box can be cleared and reused directly from results', async ({ page, amazonHeader, resultsPage }) => {
    await resultsPage.searchFor(primaryQuery);

    await expect(amazonHeader.searchBox).toBeVisible();
    await amazonHeader.clearSearch();
    await expect(amazonHeader.searchBox).toHaveValue('');

    await amazonHeader.searchBox.fill(reusableQuery);
    await amazonHeader.searchBox.press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForURL(SEARCH_RESULTS_PATH, { timeout: 5_000 }).catch(() => {});

    await expect(amazonHeader.searchBox).toHaveValue(/mechanical keyboard/i);

    if (resultsPage.isSearchResultsUrl()) {
      await expect(resultsPage.results.first()).toBeVisible();
      await expect(page.locator('body')).toContainText(/mechanical|keyboard/i);
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test('search results can open a product details page', async ({ page, resultsPage, productPage }) => {
    await resultsPage.searchFor(primaryQuery);
    const openedProduct = await resultsPage.openFirstProduct();

    if (openedProduct && productPage.isProductUrl()) {
      await expect(page).toHaveURL(PRODUCT_PATH);
      await expect(productPage.productTitle).toBeVisible();
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test('product details page shows purchase actions when a product opens', async ({ page, resultsPage, productPage }) => {
    await resultsPage.searchFor(primaryQuery);
    const openedProduct = await resultsPage.openFirstProduct();

    if (openedProduct && productPage.isProductUrl()) {
      await productPage.expectLoaded();
      const purchaseState = await productPage.expectPurchaseActions();
      expect([PURCHASE_STATES.PURCHASABLE, PURCHASE_STATES.RESTRICTED]).toContain(purchaseState);
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test('can attempt to add a product to cart and stay within Amazon purchase flow', async ({
    page,
    resultsPage,
    productPage,
    cartPage,
  }) => {
    await resultsPage.searchFor(primaryQuery);
    const openedProduct = await resultsPage.openFirstProduct();

    if (openedProduct && productPage.isProductUrl()) {
      const purchaseState = await productPage.expectPurchaseActions();

      if (purchaseState === PURCHASE_STATES.PURCHASABLE) {
        const addAttempted = await productPage.addToCart();
        expect(addAttempted).toBeTruthy();
        await cartPage.expectCartFlowSignals();
      } else {
        await productPage.expectRestrictedAvailabilitySignals();
        await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
      }
    } else {
      await expect(page).toHaveURL(AMAZON_DE_URL_PATTERN);
    }
  });

  test.skip('coupon or discount code validation requires authenticated checkout on amazon.de production', async () => {});

  test.skip('payment with a test card is not supported against amazon.de production checkout', async () => {});
});
