import { test as base, expect } from "@playwright/test";

export const POST_ID = "test-fixture-post";
export const DRAFT_POST_ID = "test-fixture-draft";
export const FULL_POST_ID = "test-fixture-full";

export const test = base.extend<{ postId: string }>({
  postId: async ({}, use) => {
    await use(POST_ID);
  },
});

export { expect };
