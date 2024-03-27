import { z, defineCollection } from "astro:content";

const postCollection = defineCollection({
  type: "content",
  schema: z.object({
    url: z.string(),
    title: z.string(),
    pubDate: z.string(),
    tags: z.array(z.string()),
    summary: z.string(),
  }),
});

export const collections = {
  posts: postCollection,
};
