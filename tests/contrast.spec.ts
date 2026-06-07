import { test, expect, type Page } from "@playwright/test";

/**
 * WCAG 2.1 contrast ratio between two colors.
 * Formula: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [channel(r), channel(g), channel(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/(\d+(?:\.\d+)?)/g);
  if (!match || match.length < 3) throw new Error(`Cannot parse color: ${value}`);
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

async function readColors(page: Page) {
  return page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const probe = document.createElement("div");
    document.body.appendChild(probe);

    const resolve = (varName: string) => {
      probe.style.color = styles.getPropertyValue(varName).trim();
      return getComputedStyle(probe).color;
    };

    const result = {
      bg: resolve("--color-bg"),
      text: resolve("--color-text"),
      muted: resolve("--color-text-muted"),
      accent: resolve("--color-accent"),
    };

    probe.remove();
    return result;
  });
}

// WCAG AA thresholds: 4.5:1 for normal text, 3:1 for large text / UI components
const AA_NORMAL = 4.5;
const AA_LARGE = 3;

test.describe("color contrast — light theme", () => {
  test("text and accent meet WCAG AA against background", async ({ page }) => {
    await page.goto("/");
    const colors = await readColors(page);
    const bg = parseRgb(colors.bg);

    expect(contrastRatio(parseRgb(colors.text), bg), "body text vs background").toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(parseRgb(colors.accent), bg), "accent vs background").toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(parseRgb(colors.muted), bg), "muted text vs background").toBeGreaterThanOrEqual(AA_LARGE);
  });
});

test.describe("color contrast — dark theme", () => {
  test("text and accent meet WCAG AA against background", async ({ page }) => {
    await page.goto("/");
    await page.locator("#theme-toggle").click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    const colors = await readColors(page);
    const bg = parseRgb(colors.bg);

    expect(contrastRatio(parseRgb(colors.text), bg), "body text vs background").toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(parseRgb(colors.accent), bg), "accent vs background").toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(parseRgb(colors.muted), bg), "muted text vs background").toBeGreaterThanOrEqual(AA_LARGE);
  });
});
