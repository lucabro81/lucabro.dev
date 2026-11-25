import { getCollection } from "astro:content";

// Drafts (`draft: true`) are visible in `astro dev` only, never in the build.
export async function getPublishedPosts() {
  const posts = await getCollection(
    "posts",
    (post) => import.meta.env.DEV || !post.data.draft
  );
  return posts.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
  );
}
