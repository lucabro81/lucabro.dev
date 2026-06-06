import { test as base, expect } from "@playwright/test";
import { POST_ID } from "./global-setup";

export const test = base.extend<{ postId: string }>({
  postId: async ({}, use) => {
    await use(POST_ID);
  },
});

export { expect, POST_ID };
