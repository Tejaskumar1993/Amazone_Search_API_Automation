// @ts-check

async function safeIsVisible(locator) {
  return locator.isVisible().catch(() => false);
}

module.exports = { safeIsVisible };
