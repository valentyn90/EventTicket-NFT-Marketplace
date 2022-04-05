import { test, expect } from "@playwright/test";

const url = process.env.TARGET_URL || "http://localhost:3000";

test("should navigate to the index page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(url);
  await expect(page).toHaveURL(`${url}/create`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the create page", async ({ page }) => {
  await page.goto(`${url}/create`);
  await expect(page).toHaveURL(`${url}/create`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the step-1 page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/create/step-1`);
  await expect(page).toHaveURL(`${url}/signup`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the faq page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/faq`);
  await expect(page).toHaveURL(`${url}/faq`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the terms page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/terms`);
  await expect(page).toHaveURL(`${url}/terms`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the privacy page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/privacy`);
  await expect(page).toHaveURL(`${url}/privacy`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the signin page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/signin`);
  await expect(page).toHaveURL(`${url}/signin`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the signup page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/signup`);
  await expect(page).toHaveURL(`${url}/signup`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the share page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/share`);
  await expect(page).toHaveURL(`${url}/share`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the redirect page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/redirect`);
  await expect(page).toHaveURL(`${url}/redirect`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the recruit page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/recruit`);
  await page.waitForURL(`${url}/signin`);
  await expect(page).toHaveURL(`${url}/signin`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the profile page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/profile`);
  await expect(page).toHaveURL(`${url}/signin`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the marketplace page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/marketplace`);
  await expect(page).toHaveURL(`${url}/marketplace`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the listings page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/listings`);
  await expect(page).toHaveURL(`${url}/signin`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the collection page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/collection`);
  await expect(page).toHaveURL(`${url}/signin`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});

test("should navigate to the admin page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto(`${url}/admin`);
  await expect(page).toHaveURL(`${url}/create`);
  await expect(page).not.toHaveTitle("404: This page could not be found");
});
