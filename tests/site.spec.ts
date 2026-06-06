import { test, expect } from "./fixtures";

test.describe("index", () => {
  test("shows post list", async ({ page, postId }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("lucabro.dev");
    const posts = page.locator(".post-list .post-item");
    await expect(posts).not.toHaveCount(0);
  });

  test("fixture post appears in list", async ({ page, postId }) => {
    await page.goto("/");
    const link = page.locator(`.post-link[href="/${postId}"]`);
    await expect(link).toBeVisible();
  });

  test("post excerpt visible", async ({ page, postId }) => {
    await page.goto("/");
    const excerpt = page.locator(".post-excerpt").first();
    await expect(excerpt).toBeVisible();
    await expect(excerpt).not.toBeEmpty();
  });
});

test.describe("post page", () => {
  test("renders title and date", async ({ page, postId }) => {
    await page.goto(`/${postId}`);
    await expect(page.locator(".post-header h1")).toContainText("Test fixture post");
    await expect(page.locator("time")).toBeVisible();
  });

  test("renders body content", async ({ page, postId }) => {
    await page.goto(`/${postId}`);
    const body = page.locator(".post-body");
    await expect(body).toBeVisible();
    await expect(body.locator("p").first()).not.toBeEmpty();
  });
});

test.describe("about page", () => {
  test("loads and shows heading", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator(".about h1")).toContainText("THIS WILL FAIL");
  });
});

test.describe("navigation", () => {
  test("logo links to index", async ({ page }) => {
    await page.goto("/about");
    await page.locator(".site-name").click();
    await expect(page).toHaveURL("/");
  });

  test("about link navigates to about", async ({ page }) => {
    await page.goto("/");
    await page.locator(".site-nav a[href='/about']").click();
    await expect(page).toHaveURL("/about");
  });
});

test.describe("fonts", () => {
  test("IBM Plex Serif loaded", async ({ page }) => {
    await page.goto("/");
    const loaded = await page.evaluate(() =>
      document.fonts.check("16px 'IBM Plex Serif'")
    );
    expect(loaded).toBe(true);
  });

  test("IBM Plex Mono loaded", async ({ page }) => {
    await page.goto("/");
    const loaded = await page.evaluate(() =>
      document.fonts.check("16px 'IBM Plex Mono'")
    );
    expect(loaded).toBe(true);
  });
});
