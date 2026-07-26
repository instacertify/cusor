import fs from "fs";
import path from "path";

export interface GmarkCategory {
  category: string;
  family: string;
  standards: string;
  emc: string;
  iecee: string;
  gso_nb: string;
}

let cache: GmarkCategory[] | null = null;

export function clearGmarkCache() {
  cache = null;
}

export function getGmarkCategories(): GmarkCategory[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "gmark_categories.json");
  cache = JSON.parse(fs.readFileSync(file, "utf8")) as GmarkCategory[];
  return cache;
}

export function getGmarkFamilies(): string[] {
  return [...new Set(getGmarkCategories().map((c) => c.family))];
}
