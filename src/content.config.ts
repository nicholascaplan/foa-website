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
    ctaLabel: z.string().optional(),
    archive: z.boolean().default(false),
    allDay: z.boolean().default(false),
    archiveFrom: z.coerce.date().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    pastSummary: z.string().optional(),
    lead: z.string().optional(),
    ticketPrice: z.string().optional(),
    schedule: z.array(z.object({
      time: z.coerce.date(),
      label: z.string(),
      detail: z.string().optional(),
    })).optional(),
    reviewed: z.coerce.date().optional(),
  }),
});

const newsletters = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/newsletters" }),
  schema: z.object({
    title: z.string(),
    published: z.coerce.date().optional(),
    summary: z.string(),
    sections: z.array(z.object({ title: z.string().optional(), paragraphs: z.array(z.string()).default([]), list: z.array(z.string()).optional(), closing: z.array(z.string()).optional() })).optional(),
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
