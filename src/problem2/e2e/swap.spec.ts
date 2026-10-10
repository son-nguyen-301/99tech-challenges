import { expect, type Page, test } from "@playwright/test";

import prices from "./fixtures/prices.json" with { type: "json" };
import { TEST_ENV } from "./testEnv";

const EMPTY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>';

// Fixture prices: ETH 2000, USDC 1, WBTC 40000, ATOM 8.
async function mockNetwork(page: Page) {
  await page.route(TEST_ENV.VITE_PRICES_URL, (route) =>
    route.fulfill({ json: prices }),
  );
  await page.route(`${TEST_ENV.VITE_TOKEN_ICONS_URL}/**`, (route) =>
    route.fulfill({ contentType: "image/svg+xml", body: EMPTY_ICON }),
  );
}

test.describe("swap form", () => {
  test.beforeEach(async ({ page }) => {
    await mockNetwork(page);
    await page.goto("/");
  });

  test("starts with ETH to USDC and shows the rate", async ({ page }) => {
    await expect(page.getByTestId("pay-token-button")).toHaveText("ETH");
    await expect(page.getByTestId("receive-token-button")).toHaveText("USDC");
    await expect(page.getByTestId("exchange-rate")).toHaveText(
      "1 ETH = 2,000 USDC",
    );
  });

  test("calculates the other amount in both directions", async ({ page }) => {
    await page.getByTestId("pay-amount-input").fill("1.5");
    await expect(page.getByTestId("receive-amount-input")).toHaveValue("3000");
    await expect(page.getByTestId("pay-usd-value")).toHaveText("$3,000.00");
    await expect(page.getByTestId("receive-usd-value")).toHaveText("$3,000.00");

    await page.getByTestId("receive-amount-input").fill("500");
    await expect(page.getByTestId("pay-amount-input")).toHaveValue("0.25");
  });

  test("only accepts numbers in the amount fields", async ({ page }) => {
    await page.getByTestId("pay-amount-input").pressSequentially("1a,5x");

    await expect(page.getByTestId("pay-amount-input")).toHaveValue("1.5");
  });

  test("switches the two sides", async ({ page }) => {
    await page.getByTestId("pay-amount-input").fill("1");
    await page.getByTestId("switch-tokens-button").click();

    await expect(page.getByTestId("pay-token-button")).toHaveText("USDC");
    await expect(page.getByTestId("pay-amount-input")).toHaveValue("2000");
    await expect(page.getByTestId("receive-amount-input")).toHaveValue("1");
    await expect(page.getByTestId("exchange-rate")).toHaveText(
      "1 USDC = 0.0005 ETH",
    );
  });

  test("changes a token from the search dialog", async ({ page }) => {
    await page.getByTestId("pay-amount-input").fill("1");
    await page.getByTestId("receive-token-button").click();

    await page.getByTestId("token-search-input").fill("wb");
    await expect(page.getByTestId(/^token-option-/)).toHaveCount(1);
    await page.getByTestId("token-option-WBTC").click();

    await expect(page.getByTestId("token-dialog")).toBeHidden();
    await expect(page.getByTestId("receive-token-button")).toHaveText("WBTC");
    await expect(page.getByTestId("receive-amount-input")).toHaveValue("0.05");
  });

  test("picks a token with the keyboard without submitting the swap", async ({
    page,
  }) => {
    await page.getByTestId("pay-amount-input").fill("1");
    await page.getByTestId("receive-token-button").click();

    await expect(page.getByTestId("token-search-input")).toBeFocused();
    await page.keyboard.type("atom");
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("receive-token-button")).toHaveText("ATOM");
    await expect(page.getByTestId("receive-amount-input")).toHaveValue("250");
    await expect(page.getByTestId("submit-button")).toHaveAttribute(
      "aria-disabled",
      "false",
    );
    await expect(page.getByTestId("swap-success")).toHaveCount(0);
  });

  test("shows an error when submitting without a valid amount", async ({
    page,
  }) => {
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("pay-amount-error")).toHaveText(
      "Enter an amount",
    );
    await expect(page.getByTestId("pay-amount-input")).toBeFocused();
    await expect(page.getByTestId("pay-amount-input")).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    await page.getByTestId("pay-amount-input").fill("0");
    await expect(page.getByTestId("pay-amount-error")).toHaveText(
      "Enter an amount greater than 0",
    );

    await page.getByTestId("pay-amount-input").fill("2");
    await expect(page.getByTestId("pay-amount-error")).toHaveCount(0);
  });

  test("submits the swap and confirms it", async ({ page }) => {
    await page.getByTestId("pay-amount-input").fill("1.5");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("submit-button")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(page.getByTestId("swap-success")).toHaveText(
      "Swapped 1.5 ETH for 3,000 USDC.",
    );
    await expect(page.getByTestId("pay-amount-input")).toHaveValue("");
    await expect(page.getByTestId("submit-button")).toHaveAttribute(
      "aria-disabled",
      "false",
    );
  });

  test("tells the user when the swap fails", async ({ page, context }) => {
    await page.getByTestId("pay-amount-input").fill("1.5");
    await context.setOffline(true);
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("swap-error")).toBeVisible();
    await expect(page.getByTestId("pay-amount-input")).toHaveValue("1.5");
  });
});

test("lets the user retry when prices fail to load", async ({ page }) => {
  await page.route(TEST_ENV.VITE_PRICES_URL, (route) =>
    route.fulfill({ status: 500 }),
  );
  await page.goto("/");

  await expect(page.getByTestId("prices-error")).toBeVisible();

  await page.unroute(TEST_ENV.VITE_PRICES_URL);
  await mockNetwork(page);
  await page.getByTestId("prices-retry-button").click();

  await expect(page.getByTestId("swap-form")).toBeVisible();
});
