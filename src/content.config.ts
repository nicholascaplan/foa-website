import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const events = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    location: z.string(),
    status: z.enum(["confirmed", "tickets-planned", "save-the-date", "completed"]),
    statusLabel: z.string(),
    path: z.string().optional(),
    featured: z.boolean().default(false),
    archive: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    lead: z.string().optional(),
    ticketPrice: z.string().optional(),
    reviewed: z.coerce.date().optional(),
  }),
});

const newsletters = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/newsletters" }),
  schema: z.object({
    title: z.string(),
    published: z.coerce.date().optional(),
    summary: z.string(),
    latest: z.boolean().default(false),
  }),
});

const committee = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/committee" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    portrait: z.string(),
    order: z.number(),
    imageClass: z.string().optional(),
  }),
});

export const collections = { events, newsletters, committee };
