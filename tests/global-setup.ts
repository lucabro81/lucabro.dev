import { writeFileSync } from "fs";
import { join } from "path";

export const POST_ID = "test-fixture-post";

export default async function setup() {
  writeFileSync(
    join(process.cwd(), "src/content/posts", `${POST_ID}.md`),
    `---
title: "Test fixture post"
date: "2000-01-01"
description: "Fixture post used by automated tests."
---

This post is created by the test suite and should not appear in production.
`,
    "utf-8"
  );
}
