import { test } from "@playwright/test";

test("LoginForm.onSubmit", async ({ page, context, browser, playwright }) => {
  await page.goto("/");
});
