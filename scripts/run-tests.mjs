import { spawn } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(process.cwd(), "src/content/posts");

const FIXTURES = {
  "test-fixture-post": `---
title: "Test fixture post"
date: "2000-01-01"
description: "Fixture post used by automated tests."
---

This post is created by the test suite and should not appear in production.
`,
  "test-fixture-draft": `---
title: "Test fixture draft"
date: "2000-01-02"
description: "Draft fixture: must not be published."
draft: true
---

This draft must never reach the build.
`,
};

const fixturePath = (id) => join(POSTS_DIR, `${id}.md`);

function writeFixtures() {
  for (const [id, content] of Object.entries(FIXTURES)) {
    writeFileSync(fixturePath(id), content, "utf-8");
  }
}

function removeFixtures() {
  for (const id of Object.keys(FIXTURES)) {
    rmSync(fixturePath(id), { force: true });
  }
}

async function run() {
  writeFixtures();

  const pw = spawn("npx", ["playwright", "test", ...process.argv.slice(2)], {
    stdio: "inherit",
  });

  const code = await new Promise((resolve) => {
    pw.on("close", resolve);
    pw.on("error", () => resolve(1));
  });

  removeFixtures();
  process.exit(code);
}

process.on("SIGINT", () => { removeFixtures(); process.exit(130); });
process.on("SIGTERM", () => { removeFixtures(); process.exit(143); });

run();
