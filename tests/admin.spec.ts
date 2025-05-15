import { test } from "./admin.fixtures";

test("todo", async ({ page }) => {
  await page.goto("http://localhost:4000/api/login");
  await page.goto("/");
});
