// @ts-check

const AMAZON_DE_URL_PATTERN = /amazon\.de/i;
const SEARCH_RESULTS_PATH = /\/s([/?]|$)/i;
const PRODUCT_PATH = /\/(dp|gp\/product)\//i;

const PURCHASE_STATES = {
  PURCHASABLE: 'purchasable',
  RESTRICTED: 'restricted',
  UNKNOWN: null,
};

const TIMEOUTS = {
  STATE_POLL: 250,
  PURCHASE_STATE_TIMEOUT: 5_000,
  DOM_READY_TIMEOUT: 15_000,
};

const I18N_STRINGS = {
  CONTINUE_SHOPPING: { de: 'weiter shoppen', en: 'continue shopping' },
  ERROR_MESSAGES: { de: 'tut uns leid', en: 'sorry' },
  BACK_TO_HOME: { de: 'zur homepage', en: 'back to homepage' },
  CART_HEADING: { de: 'einkaufswagen', en: 'shopping cart', alt_en: 'warenkorb' },
};

module.exports = {
  AMAZON_DE_URL_PATTERN,
  SEARCH_RESULTS_PATH,
  PRODUCT_PATH,
  PURCHASE_STATES,
  TIMEOUTS,
  I18N_STRINGS,
};
