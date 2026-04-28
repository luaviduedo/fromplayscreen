import { getGameProfile, type GameProfile } from "@/lib/game-profile";
import type { NormalizedSteamGame } from "@/types/steam";

export type WeightedGameProfile = GameProfile & {
  weight: number;
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

function getGameWeight(game: NormalizedSteamGame) {
  if (
    typeof game.minutesLast2Weeks === "number" &&
    game.minutesLast2Weeks > 0
  ) {
    return game.minutesLast2Weeks;
  }

  return game.minutesTotal > 0 ? game.minutesTotal : 1;
}

function filterRelevantGenres(genres: string[]) {
  return genres.filter((genre) => !IRRELEVANT_TOP_GENRES.has(genre));
}

export async function buildUserGameProfile(
  games: NormalizedSteamGame[],
): Promise<UserGameProfile> {
  const sourceGames = await Promise.all(
    games.map(async (game) => {
      const profile = await getGameProfile(game.appId);

      return {
        ...profile,
        weight: getGameWeight(game),
      };
    }),
  );

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
    topTags: getTopKeys(tagsMap, 10),
    topGenres: getTopKeys(genresMap, 5),
    topCategories: getTopKeys(categoriesMap, 5),
  };
}
