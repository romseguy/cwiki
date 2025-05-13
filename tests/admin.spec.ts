import { test } from "./admin.fixtures";

test("todo", async ({ page }) => {
  await page.goto("http://localhost:3000/api/login");
  await page.goto("/");
});
