import { rmSync } from "fs";
import { join } from "path";
import { POST_ID } from "./global-setup";

export default async function teardown() {
  rmSync(join(process.cwd(), "src/content/posts", `${POST_ID}.md`), {
    force: true,
  });
}
