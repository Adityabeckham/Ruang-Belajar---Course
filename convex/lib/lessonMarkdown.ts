import yaml from "js-yaml";

export interface LessonFrontmatter {
  title?: string;
  slug?: string;
  xpReward?: number;
  order?: number;
  [key: string]: unknown;
}

export interface ParsedLesson {
  data: LessonFrontmatter;
  contentMd: string;
}

// Frontmatter YAML di antara `---` di awal file (PRD §6). Body = sisanya.
const FRONTMATTER_RE = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Pisahkan frontmatter (YAML) dari body Markdown sebuah lesson.
 * Tanpa frontmatter → data kosong, contentMd = seluruh teks.
 */
export function parseLessonMarkdown(raw: string): ParsedLesson {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { data: {}, contentMd: raw.trim() };
  }
  let data: LessonFrontmatter = {};
  try {
    const loaded = yaml.load(match[1]);
    if (loaded && typeof loaded === "object") {
      data = loaded as LessonFrontmatter;
    }
  } catch {
    data = {};
  }
  const contentMd = raw.slice(match[0].length).trim();
  return { data, contentMd };
}

/** title → slug URL-friendly. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
