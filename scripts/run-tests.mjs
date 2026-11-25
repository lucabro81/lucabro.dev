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

## Only section

A single h2 is not enough for a table of contents.
`,
  "test-fixture-full": `---
title: "Test fixture full post"
date: "2000-01-03"
description: "Fixture post with TL;DR and headings."
tldr: "Fixture summary used to test the TL;DR block."
---

Intro paragraph before the first section, with a footnote.[^1]

## 1. First section

Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. 

### 1.1 First subsection

Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. 

## 2. Second section

Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. 

### 2.1 Second subsection

Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. 

### 2.2 Another subsection

Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. 

## 3. Third section

Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. 

Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. Filler paragraph to give the page enough height to scroll through every section. 

[^1]: A footnote, so Astro generates its own Footnotes heading.
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
