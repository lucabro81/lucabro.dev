import { spawn } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const POST_ID = "test-fixture-post";
const POST_PATH = join(process.cwd(), "src/content/posts", `${POST_ID}.md`);

function writeFixture() {
  writeFileSync(
    POST_PATH,
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

function removeFixture() {
  rmSync(POST_PATH, { force: true });
}

async function run() {
  writeFixture();

  const pw = spawn("npx", ["playwright", "test", ...process.argv.slice(2)], {
    stdio: "inherit",
  });

  const code = await new Promise((resolve) => {
    pw.on("close", resolve);
    pw.on("error", () => resolve(1));
  });

  removeFixture();
  process.exit(code);
}

process.on("SIGINT", () => { removeFixture(); process.exit(130); });
process.on("SIGTERM", () => { removeFixture(); process.exit(143); });

run();
