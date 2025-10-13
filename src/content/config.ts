import { defineCollection, z } from 'astro:content';

const extractDateFromPath = (id: string) => {
  const match = id.match(/([0-9]{4})\/([0-9]{2})\/([0-9]{2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(`${year}-${month}-${day}`);
  }
  return undefined;
};

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date().optional().transform((date, ctx) => {
      if (date) return date;
      const extracted = extractDateFromPath(ctx.path);
      return extracted || new Date();
    }),
  }),
});

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date().optional().transform((date, ctx) => {
      if (date) return date;
      const extracted = extractDateFromPath(ctx.path);
      return extracted || new Date();
    }),
  }),
});

const experiments = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date().optional().transform((date, ctx) => {
      if (date) return date;
      const extracted = extractDateFromPath(ctx.path);
      return extracted || new Date();
    }),
  }),
});

const links = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    link: z.string().url(),
    date: z.date().optional().transform((date, ctx) => {
      if (date) return date;
      const extracted = extractDateFromPath(ctx.path);
      return extracted || new Date();
    }),
  }),
});

export const collections = { articles, notes, experiments, links };
