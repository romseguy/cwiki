import { test } from "./normal.fixtures";

test.describe("todo", () => {
  test("todo", async ({ page }) => {
    await page.goto("/");
  });
});
