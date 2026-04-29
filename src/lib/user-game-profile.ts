import { getGameProfile, type GameProfile } from "@/lib/game-profile";
import type { NormalizedSteamGame } from "@/types/steam";

export type WeightedGameProfile = GameProfile & {
  weight: number;
  relevanceScore: number;
};

export type UserGameProfile = {
  sourceGames: WeightedGameProfile[];
  topTags: string[];
  topGenres: string[];
  topCategories: string[];
};

const IRRELEVANT_TOP_GENRES = new Set([
  "free to play",
  "massively multiplayer",
  "early access",
  "sports",
  "racing",
  "simulation",
  "strategy",
  "casual",
  "indie",
  "utilities",
  "animation & modeling",
  "design & illustration",
  "education",
  "software training",
  "web publishing",
  "game development",
  "photo editing",
  "audio production",
  "video production",
]);

const IRRELEVANT_GAME_NAME_TERMS = [
  "soundtrack",
  "demo",
  "test server",
  "dedicated server",
  "benchmark",
  "editor",
  "tool",
  "server",
];

function addWeightedValues(
  map: Map<string, number>,
  values: string[],
  weight: number,
) {
  for (const value of values) {
    map.set(value, (map.get(value) ?? 0) + weight);
  }
}

function getTopKeys(map: Map<string, number>, limit = 10) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeMinutesWeight(minutes: number, maxWeight: number) {
  if (minutes <= 0) return 1;

  // suaviza diferenças absurdas
  // ex.: 10000 min não destrói completamente o resto
  const scaled = Math.sqrt(minutes);

  return clamp(Math.round(scaled), 1, maxWeight);
}

function getGameWeight(game: NormalizedSteamGame) {
  if (
    typeof game.minutesLast2Weeks === "number" &&
    game.minutesLast2Weeks > 0
  ) {
    return normalizeMinutesWeight(game.minutesLast2Weeks, 40);
  }

  return normalizeMinutesWeight(game.minutesTotal, 120);
}

function filterRelevantGenres(genres: string[]) {
  return genres.filter((genre) => !IRRELEVANT_TOP_GENRES.has(genre));
}

function isRelevantGameName(name: string) {
  const normalized = name.trim().toLowerCase();

  return !IRRELEVANT_GAME_NAME_TERMS.some((term) => normalized.includes(term));
}

function getThemeRichnessScore(profile: GameProfile) {
  const tagScore = profile.tags.length * 4;
  const genreScore = profile.genres.length * 2;
  const categoryScore = profile.categories.length;

  const shortDescriptionScore =
    profile.shortDescription && profile.shortDescription.length > 40 ? 3 : 0;

  return tagScore + genreScore + categoryScore + shortDescriptionScore;
}

function getRelevanceScore(profile: GameProfile, weight: number) {
  return weight * 3 + getThemeRichnessScore(profile);
}

export async function buildUserGameProfile(
  games: NormalizedSteamGame[],
): Promise<UserGameProfile> {
  const relevantGames = games.filter((game) => isRelevantGameName(game.name));

  const enrichedGames = await Promise.all(
    relevantGames.map(async (game) => {
      const profile = await getGameProfile(game.appId);
      const weight = getGameWeight(game);
      const relevanceScore = getRelevanceScore(profile, weight);

      return {
        ...profile,
        weight,
        relevanceScore,
      };
    }),
  );

  const sourceGames = enrichedGames
    .filter((game) => game.tags.length > 0 || game.genres.length > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const tagsMap = new Map<string, number>();
  const genresMap = new Map<string, number>();
  const categoriesMap = new Map<string, number>();

  for (const game of sourceGames) {
    addWeightedValues(tagsMap, game.tags, game.weight);
    addWeightedValues(
      genresMap,
      filterRelevantGenres(game.genres),
      game.weight,
    );
    addWeightedValues(categoriesMap, game.categories, game.weight);
  }

  return {
    sourceGames,
    topTags: getTopKeys(tagsMap, 12),
    topGenres: getTopKeys(genresMap, 6),
    topCategories: getTopKeys(categoriesMap, 6),
  };
}
