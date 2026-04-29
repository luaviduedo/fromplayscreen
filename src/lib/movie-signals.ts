import type { UserGameProfile } from "@/lib/user-game-profile";

export type MovieSignals = {
  movieThemes: string[];
  movieGenres: string[];
  searchTerms: string[];
  keywordCandidates: string[];
};

type ThemeSignalConfig = {
  searchTokens: string[];
  tmdbGenres: string[];
};

const STRONG_THEME_TAGS = new Set([
  "cyberpunk",
  "sci-fi",
  "science-fiction",
  "futuristic",
  "cybernetics",
  "space",
  "space-sim",
  "space-combat",
  "aliens",
  "robots",
  "mechs",
  "dystopian",
  "post-apocalyptic",
  "time-travel",
  "steampunk",
  "dieselpunk",

  "fantasy",
  "dark-fantasy",
  "magic",
  "medieval",
  "dragons",
  "mythology",
  "vampire",
  "werewolves",
  "lovecraftian",
  "supernatural",
  "demons",
  "witch",

  "horror",
  "survival-horror",
  "psychological-horror",
  "psychological",
  "thriller",
  "mystery",
  "detective",
  "investigation",
  "noir",
  "zombies",
  "survival",
  "dark",
  "gothic",
  "gore",
  "blood",

  "action",
  "adventure",
  "superhero",
  "assassin",
  "pirates",
  "western",
  "crime",
  "heist",
  "war",
  "historical",
  "world-war-ii",
  "world-war-i",
  "cold-war",
  "military",
  "rome",
  "dino",
  "dinosaurs",
  "political",

  "drama",
  "romance",
  "comedy",
  "satire",
  "anime",
  "martial-arts",
  "samurai",
  "ninja",
]);

const USEFUL_GENRES = new Set([
  "action",
  "adventure",
  "horror",
  "fantasy",
  "documentary",
]);

const IRRELEVANT_TAGS = new Set([
  "singleplayer",
  "multiplayer",
  "co-op",
  "online-co-op",
  "local-co-op",
  "local-multiplayer",
  "pvp",
  "online-pvp",
  "split-screen",
  "mmo",
  "mmorpg",

  "controller",
  "full-controller-support",
  "steam-achievements",
  "steam-cloud",
  "remote-play-together",
  "family-sharing",
  "steam-deck",
  "in-app-purchases",
  "early-access",
  "free-to-play",

  "first-person",
  "third-person",
  "top-down",
  "isometric",
  "side-scroller",
  "2d",
  "3d",
  "2.5d",
  "text-based",
  "pixel-graphics",
  "retro",
  "low-poly",
  "voxel",
  "hand-drawn",
  "cel-shaded",
  "colorful",
  "minimalist",

  "difficult",
  "hard",
  "tutorial",
  "replay-value",
  "short",
  "fast-paced",
  "turn-based",
  "real-time",
  "procedural-generation",
  "score-attack",
  "arcade",
  "character-customization",
  "crafting",
  "base-building",
  "inventory-management",
  "loot",
  "multiple-endings",
  "management",
  "resource-management",
  "city-builder",
  "colony-sim",
  "sandbox",
  "platformer",
  "parkour",
  "driving",
  "racing",
  "sports",
  "shooter",
  "strategy",
  "rogue-like",
  "choices-matter",
  "open-world",
  "exploration",
  "immersive-sim",

  "masterpiece",
  "memes",
  "funny",
  "great-soundtrack",
  "soundtrack",

  "nsfw",
  "nudity",
  "mature",
  "sexual-content",
  "hentai",
]);

const IRRELEVANT_GENRES = new Set([
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

const THEME_SIGNAL_MAP: Record<string, ThemeSignalConfig> = {
  "sci-fi": {
    searchTokens: ["sci-fi"],
    tmdbGenres: ["science-fiction"],
  },
  "science-fiction": {
    searchTokens: ["science-fiction"],
    tmdbGenres: ["science-fiction"],
  },
  futuristic: {
    searchTokens: ["futuristic"],
    tmdbGenres: ["science-fiction"],
  },
  cybernetics: {
    searchTokens: ["cybernetics"],
    tmdbGenres: ["science-fiction", "action"],
  },
  cyberpunk: {
    searchTokens: ["cyberpunk"],
    tmdbGenres: ["science-fiction", "thriller"],
  },
  space: {
    searchTokens: ["space"],
    tmdbGenres: ["science-fiction", "adventure"],
  },
  "space-sim": {
    searchTokens: ["space-sim", "space"],
    tmdbGenres: ["science-fiction", "adventure"],
  },
  "space-combat": {
    searchTokens: ["space-combat", "space"],
    tmdbGenres: ["action", "science-fiction"],
  },
  aliens: {
    searchTokens: ["aliens"],
    tmdbGenres: ["science-fiction", "horror"],
  },
  robots: {
    searchTokens: ["robots"],
    tmdbGenres: ["science-fiction", "action"],
  },
  mechs: {
    searchTokens: ["mechs"],
    tmdbGenres: ["science-fiction", "action"],
  },
  dystopian: {
    searchTokens: ["dystopian"],
    tmdbGenres: ["science-fiction", "thriller"],
  },
  "post-apocalyptic": {
    searchTokens: ["post-apocalyptic"],
    tmdbGenres: ["science-fiction", "thriller"],
  },
  "time-travel": {
    searchTokens: ["time-travel"],
    tmdbGenres: ["science-fiction", "thriller"],
  },
  steampunk: {
    searchTokens: ["steampunk"],
    tmdbGenres: ["science-fiction", "fantasy"],
  },
  dieselpunk: {
    searchTokens: ["dieselpunk"],
    tmdbGenres: ["science-fiction", "action"],
  },

  fantasy: {
    searchTokens: ["fantasy"],
    tmdbGenres: ["fantasy", "adventure"],
  },
  "dark-fantasy": {
    searchTokens: ["dark-fantasy"],
    tmdbGenres: ["fantasy", "horror", "thriller"],
  },
  magic: {
    searchTokens: ["magic"],
    tmdbGenres: ["fantasy", "adventure"],
  },
  medieval: {
    searchTokens: ["medieval"],
    tmdbGenres: ["fantasy", "history"],
  },
  dragons: {
    searchTokens: ["dragons"],
    tmdbGenres: ["fantasy", "adventure"],
  },
  mythology: {
    searchTokens: ["mythology"],
    tmdbGenres: ["fantasy", "adventure"],
  },
  vampire: {
    searchTokens: ["vampire"],
    tmdbGenres: ["horror", "fantasy"],
  },
  werewolves: {
    searchTokens: ["werewolves"],
    tmdbGenres: ["horror", "fantasy"],
  },
  lovecraftian: {
    searchTokens: ["lovecraftian"],
    tmdbGenres: ["horror", "mystery"],
  },
  supernatural: {
    searchTokens: ["supernatural"],
    tmdbGenres: ["horror", "mystery", "fantasy"],
  },
  demons: {
    searchTokens: ["demons"],
    tmdbGenres: ["horror", "fantasy", "action"],
  },
  witch: {
    searchTokens: ["witch"],
    tmdbGenres: ["horror", "fantasy"],
  },

  horror: {
    searchTokens: ["horror"],
    tmdbGenres: ["horror", "thriller"],
  },
  "survival-horror": {
    searchTokens: ["survival-horror"],
    tmdbGenres: ["horror", "thriller"],
  },
  "psychological-horror": {
    searchTokens: ["psychological-horror"],
    tmdbGenres: ["horror", "thriller"],
  },
  psychological: {
    searchTokens: ["psychological"],
    tmdbGenres: ["thriller", "drama"],
  },
  thriller: {
    searchTokens: ["thriller"],
    tmdbGenres: ["thriller"],
  },
  mystery: {
    searchTokens: ["mystery"],
    tmdbGenres: ["mystery", "thriller"],
  },
  detective: {
    searchTokens: ["detective"],
    tmdbGenres: ["mystery", "crime"],
  },
  investigation: {
    searchTokens: ["investigation"],
    tmdbGenres: ["mystery", "crime"],
  },
  noir: {
    searchTokens: ["noir"],
    tmdbGenres: ["mystery", "crime", "thriller"],
  },
  zombies: {
    searchTokens: ["zombies"],
    tmdbGenres: ["horror", "action"],
  },
  survival: {
    searchTokens: ["survival"],
    tmdbGenres: ["thriller", "action"],
  },
  dark: {
    searchTokens: ["dark"],
    tmdbGenres: ["thriller", "drama"],
  },
  gothic: {
    searchTokens: ["gothic"],
    tmdbGenres: ["horror", "fantasy"],
  },
  gore: {
    searchTokens: ["gore"],
    tmdbGenres: ["horror", "thriller"],
  },
  blood: {
    searchTokens: ["blood"],
    tmdbGenres: ["horror", "action"],
  },

  action: {
    searchTokens: ["action"],
    tmdbGenres: ["action"],
  },
  adventure: {
    searchTokens: ["adventure"],
    tmdbGenres: ["adventure"],
  },
  superhero: {
    searchTokens: ["superhero"],
    tmdbGenres: ["action", "fantasy"],
  },
  assassin: {
    searchTokens: ["assassin"],
    tmdbGenres: ["action", "crime"],
  },
  pirates: {
    searchTokens: ["pirates"],
    tmdbGenres: ["adventure", "action"],
  },
  western: {
    searchTokens: ["western"],
    tmdbGenres: ["western", "action", "drama"],
  },
  crime: {
    searchTokens: ["crime"],
    tmdbGenres: ["crime", "thriller"],
  },
  heist: {
    searchTokens: ["heist"],
    tmdbGenres: ["crime", "action"],
  },
  war: {
    searchTokens: ["war"],
    tmdbGenres: ["war", "action", "history"],
  },
  historical: {
    searchTokens: ["historical"],
    tmdbGenres: ["history", "drama"],
  },
  "world-war-ii": {
    searchTokens: ["world-war-ii"],
    tmdbGenres: ["war", "history", "drama"],
  },
  "world-war-i": {
    searchTokens: ["world-war-i"],
    tmdbGenres: ["war", "history", "drama"],
  },
  "cold-war": {
    searchTokens: ["cold-war"],
    tmdbGenres: ["thriller", "war", "history"],
  },
  military: {
    searchTokens: ["military"],
    tmdbGenres: ["war", "action"],
  },
  rome: {
    searchTokens: ["rome"],
    tmdbGenres: ["history", "action"],
  },
  dino: {
    searchTokens: ["dino", "dinosaurs"],
    tmdbGenres: ["adventure", "science-fiction"],
  },
  dinosaurs: {
    searchTokens: ["dinosaurs"],
    tmdbGenres: ["adventure", "science-fiction"],
  },

  political: {
    searchTokens: ["political"],
    tmdbGenres: ["drama", "thriller"],
  },
  drama: {
    searchTokens: ["drama"],
    tmdbGenres: ["drama"],
  },
  romance: {
    searchTokens: ["romance"],
    tmdbGenres: ["romance", "drama"],
  },
  comedy: {
    searchTokens: ["comedy"],
    tmdbGenres: ["comedy"],
  },
  satire: {
    searchTokens: ["satire"],
    tmdbGenres: ["comedy"],
  },

  anime: {
    searchTokens: ["anime"],
    tmdbGenres: ["animation", "fantasy"],
  },
  "martial-arts": {
    searchTokens: ["martial-arts"],
    tmdbGenres: ["action", "drama"],
  },
  samurai: {
    searchTokens: ["samurai"],
    tmdbGenres: ["action", "history"],
  },
  ninja: {
    searchTokens: ["ninja"],
    tmdbGenres: ["action", "thriller"],
  },

  documentary: {
    searchTokens: ["documentary"],
    tmdbGenres: ["documentary"],
  },
};

const GENRE_TO_TMDB_GENRES: Record<string, string[]> = {
  action: ["action"],
  adventure: ["adventure"],
  horror: ["horror", "thriller"],
  fantasy: ["fantasy", "adventure"],
  documentary: ["documentary"],
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function normalize(values: string[]) {
  return values.map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function cleanTags(tags: string[]) {
  return normalize(tags).filter((tag) => !IRRELEVANT_TAGS.has(tag));
}

function cleanGenres(genres: string[]) {
  return normalize(genres).filter(
    (genre) => !IRRELEVANT_GENRES.has(genre) && USEFUL_GENRES.has(genre),
  );
}

function scoreTheme(theme: string) {
  if (STRONG_THEME_TAGS.has(theme)) return 10;
  if (THEME_SIGNAL_MAP[theme]) return 4;
  return 1;
}

function sortThemes(themes: string[]) {
  return unique(themes).sort((a, b) => scoreTheme(b) - scoreTheme(a));
}

function buildGameTagTokens(profile: UserGameProfile) {
  const weightedTags = new Map<string, number>();

  for (const game of profile.sourceGames) {
    for (const rawTag of game.tags) {
      const tag = rawTag.trim().toLowerCase();

      if (!tag || IRRELEVANT_TAGS.has(tag)) continue;

      weightedTags.set(tag, (weightedTags.get(tag) ?? 0) + game.weight);
    }
  }

  return Array.from(weightedTags.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 16);
}

function buildKeywordCandidates(
  movieThemes: string[],
  gameTagTokens: string[],
) {
  const themeTokens = movieThemes.flatMap((theme) => {
    const config = THEME_SIGNAL_MAP[theme];
    if (config) return config.searchTokens;
    return [theme.replace(/-/g, " ")];
  });

  // inclui tags reais dos jogos para deixar a busca mais específica
  return unique([
    ...themeTokens,
    ...gameTagTokens.map((tag) => tag.replace(/-/g, " ")),
  ]).slice(0, 18);
}

function buildSearchTerms(keywordCandidates: string[], movieGenres: string[]) {
  const [a = "", b = "", c = "", d = ""] = keywordCandidates;

  return unique(
    [
      ...keywordCandidates.slice(0, 8),

      a ? `${a} movie` : "",
      a ? `${a} film` : "",

      a && b ? `${a} ${b}` : "",
      a && b ? `${a} ${b} movie` : "",

      a && c ? `${a} ${c}` : "",
      a && c ? `${a} ${c} movie` : "",

      a && b && c ? `${a} ${b} ${c}` : "",
      a && b && c ? `${a} ${b} ${c} movie` : "",

      a && d ? `${a} ${d}` : "",
      a && d ? `${a} ${d} movie` : "",

      movieGenres[0] ? `${movieGenres[0]} movie` : "",
    ].filter((value) => value.trim().length > 0),
  ).slice(0, 20);
}

export function buildMovieSignals(profile: UserGameProfile): MovieSignals {
  const cleanedTags = cleanTags(profile.topTags);
  const cleanedGenres = cleanGenres(profile.topGenres);

  const sortedThemes = sortThemes([...cleanedTags, ...cleanedGenres]);
  const movieThemes = sortedThemes.slice(0, 10);

  const movieGenres = unique([
    ...movieThemes.flatMap(
      (theme) => THEME_SIGNAL_MAP[theme]?.tmdbGenres ?? [],
    ),
    ...cleanedGenres.flatMap((genre) => GENRE_TO_TMDB_GENRES[genre] ?? []),
  ]).slice(0, 8);

  const gameTagTokens = buildGameTagTokens(profile);

  const keywordCandidates = buildKeywordCandidates(movieThemes, gameTagTokens);
  const searchTerms = buildSearchTerms(keywordCandidates, movieGenres);

  return {
    movieThemes,
    movieGenres,
    searchTerms,
    keywordCandidates,
  };
}
