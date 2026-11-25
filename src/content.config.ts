import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    tldr: z.string().optional(),
    tags: z.array(z.string()).optional(),
    devto_url: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { posts };
