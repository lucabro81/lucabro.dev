import { test, expect, DRAFT_POST_ID, FULL_POST_ID } from "./fixtures";

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

test.describe("unix dates", () => {
  // Fixture date 2000-01-01 at UTC midnight = 946684800.
  test("index shows the post date as a unix timestamp linking to /epoch", async ({ page, postId }) => {
    await page.goto("/");
    const item = page.locator(".post-item", {
      has: page.locator(`.post-link[href="/${postId}"]`),
    });
    const date = item.locator("a.post-date");
    await expect(date).toHaveText("946684800");
    await expect(date).toHaveAttribute("href", "/epoch?t=946684800");
    await expect(date.locator("time")).toHaveAttribute("datetime", "2000-01-01");
  });

  test("index date column has the same width on every row", async ({ page }) => {
    await page.goto("/");
    const dates = page.locator(".post-list a.post-date");
    const count = await dates.count();
    expect(count).toBeGreaterThan(1);
    const widths = new Set<number>();
    for (let i = 0; i < count; i++) {
      const box = await dates.nth(i).boundingBox();
      widths.add(Math.round(box!.width));
    }
    expect(widths.size).toBe(1);
  });

  test("post page shows the date as a unix timestamp linking to /epoch", async ({ page, postId }) => {
    await page.goto(`/${postId}`);
    const date = page.locator(".post-header a.post-date");
    await expect(date).toHaveText("946684800");
    await expect(date).toHaveAttribute("href", "/epoch?t=946684800");
    await expect(date.locator("time")).toHaveAttribute("datetime", "2000-01-01");
  });
});

test.describe("epoch page", () => {
  test("is hidden from search engines and from the nav", async ({ page }) => {
    const response = await page.goto("/epoch");
    expect(response?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.locator('.site-nav a[href^="/epoch"]')).toHaveCount(0);
    await expect(page.locator(".epoch h1")).toHaveText("You clicked a timestamp.");
  });

  test("lazy button reveals the readable date of the clicked timestamp", async ({ page }) => {
    await page.goto("/epoch?t=946684800");
    const result = page.locator(".epoch-result");
    await expect(result).toBeHidden();
    await page.locator(".epoch-button").click();
    await expect(result).toBeVisible();
    await expect(result).toContainText("Oh you lazy dev... I like you.");
    await expect(result).toContainText("Sat, 01 Jan 2000 00:00:00 GMT");
  });

  test("no lazy button without a valid timestamp", async ({ page }) => {
    await page.goto("/epoch?t=nope");
    await expect(page.locator(".epoch h1")).toBeVisible();
    await expect(page.locator(".epoch-button")).toBeHidden();
  });
});

test.describe("drafts", () => {
  // Posts with `draft: true` must stay out of the production build.
  test("draft post is not listed on index", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".post-list .post-item").first()).toBeVisible();
    await expect(page.locator(`a[href="/${DRAFT_POST_ID}"]`)).toHaveCount(0);
  });

  test("draft post has no page", async ({ page }) => {
    const response = await page.goto(`/${DRAFT_POST_ID}`);
    expect(response?.status()).toBe(404);
  });
});

test.describe("tldr", () => {
  test("is rendered from frontmatter after the post header", async ({ page }) => {
    await page.goto(`/${FULL_POST_ID}`);
    const tldr = page.locator(".post-header + .post-tldr");
    await expect(tldr).toHaveText("TL;DR: Fixture summary used to test the TL;DR block.");
    await expect(tldr.locator("strong")).toHaveText("TL;DR:");
  });

  test("is absent when the post has no tldr", async ({ page, postId }) => {
    await page.goto(`/${postId}`);
    await expect(page.locator(".post-body")).toBeVisible();
    await expect(page.locator(".post-tldr")).toHaveCount(0);
  });
});

test.describe("about page", () => {
  test("loads and shows heading", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator(".about h1")).toContainText("About");
  });
});

test.describe("navigation", () => {
  test("logo links to index", async ({ page }) => {
    await page.goto("/about");
    await page.locator(".site-name").click();
    await expect(page).toHaveURL("/");
  });

  test("projects link navigates to projects", async ({ page }) => {
    await page.goto("/");
    await page.locator(".site-nav a[href='/projects']").click();
    await expect(page).toHaveURL("/projects");
  });

  test("now link navigates to now", async ({ page }) => {
    await page.goto("/");
    await page.locator(".site-nav a[href='/now']").click();
    await expect(page).toHaveURL("/now");
  });
});

test.describe("theme toggle", () => {
  test("toggles dark class on html element", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    await page.locator("#theme-toggle").click();
    await expect(html).toHaveClass(/dark/);
    await page.locator("#theme-toggle").click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("persists theme in localStorage", async ({ page }) => {
    await page.goto("/");
    await page.locator("#theme-toggle").click();
    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");
  });
});

test.describe("pages", () => {
  test("projects page loads", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator(".entry-list-page h1")).toContainText("Projects");
  });

  test("now page loads", async ({ page }) => {
    await page.goto("/now");
    await expect(page.locator(".entry-list-page h1")).toContainText("Now");
  });
});

test.describe("footer", () => {
  // The footer used to expose the package.json version as a link to the repo.
  test("does not expose the site version", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator(".site-footer");
    await expect(footer).toBeVisible();
    await expect(footer).not.toContainText(/v\d+\.\d+\.\d+/);
    await expect(
      footer.locator('a[href="https://github.com/lucabro81/lucabro.dev"]')
    ).toHaveCount(0);
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
