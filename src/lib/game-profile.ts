import * as cheerio from "cheerio";
import { getGameMetadata } from "@/lib/game-metadata";
import { getSteamStoreTags } from "@/lib/steam-store-tags";

export type GameProfile = {
  appId: number;
  name: string;
  genres: string[];
  categories: string[];
  shortDescription: string | null;
  detailedDescription: string | null;
  developers: string[];
  publishers: string[];
  tags: string[];
};

const IRRELEVANT_MOVIE_TAGS = new Set([
  "singleplayer",
  "multi-player",
  "multiplayer",
  "co-op",
  "online-co-op",
  "local-co-op",
  "online-pvp",
  "pvp",
  "player-versus-player",
  "player-versus-environment",
  "fps",
  "first-person",
  "third-person",
  "third person",
  "massively multiplayer",
  "2d",
  "3d",
  "colorful",
  "pixel-graphics",
  "great-soundtrack",
  "soundtrack",
  "character-customization",
  "customization",
  "controller",
  "full-controller-support",
  "difficult",
  "competitive",
  "team-based",
  "free to play",
  "hard",
  "management",
  "building",
  "turn-based",
  "turn-based-strategy",
  "tutorial",
  "score-attack",
  "loot",
  "inventory-management",
  "memes",
]);

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function slugifyTag(value: string) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function cleanHtml(html: string | null) {
  if (!html) return null;

  const $ = cheerio.load(html);
  const text = $.text().replace(/\s+/g, " ").trim();

  return text || null;
}

export async function getGameProfile(appId: number): Promise<GameProfile> {
  const [metadata, storeTags] = await Promise.all([
    getGameMetadata(appId),
    getSteamStoreTags(appId),
  ]);

  const normalizedGenres = unique(metadata.genres.map(normalizeText));

  const normalizedCategories = unique(metadata.categories.map(normalizeText));

  const normalizedTags = unique(
    storeTags
      .map(normalizeText)
      .map(slugifyTag)
      .filter((tag) => !IRRELEVANT_MOVIE_TAGS.has(tag)),
  );

  return {
    appId: metadata.appId,
    name: metadata.name.trim(),
    genres: normalizedGenres,
    categories: normalizedCategories,
    shortDescription: metadata.shortDescription?.trim() ?? null,
    detailedDescription: cleanHtml(metadata.detailedDescription),
    developers: unique(metadata.developers.map((item) => item.trim())),
    publishers: unique(metadata.publishers.map((item) => item.trim())),
    tags: normalizedTags,
  };
}
