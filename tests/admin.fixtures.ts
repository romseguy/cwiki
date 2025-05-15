import { test as base, request, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ baseURL, page, browser }, use) => {
    const apiRequestContext = await request.newContext();

    await page.route("http://localhost:4000/api/login", async (route) => {
      const response = await apiRequestContext.fetch(route.request(), {
        method: "post",
        data: {
          email: "contact@lebonforum.fr",
          hash: "$2a$10$p0g02Sqy31g.P//hnG5UOeU.nQhtgeyY4qg8BeDlmxQmiVm4tgNla"
        }
      });
      const responseHeaders = response.headers();
      expect(responseHeaders).toHaveProperty("set-cookie");
      const responseCookies = new Map(
        responseHeaders["set-cookie"]
          .split("\n")
          .map((c) => c.split(";", 2)[0].split("="))
      );
      expect(responseCookies.size).toBe(2);
      const storageState = await apiRequestContext.storageState();
      const browserContext2 = await browser.newContext({ storageState });
      const contextCookies2 = await browserContext2.cookies();
      expect(
        new Map(contextCookies2.map(({ name, value }) => [name, value]))
      ).toEqual(responseCookies);
      await route.fulfill({
        response,
        headers: { ...responseHeaders, foo: "bar" }
      });
    });

    await use(page);
  }
});
