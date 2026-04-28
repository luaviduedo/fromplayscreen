import type { UserGameProfile } from "@/lib/user-game-profile";

export type MovieSignals = {
  movieThemes: string[];
  movieGenres: string[];
  searchTerms: string[];
};

const USEFUL_THEME_TAGS = new Set([
  // sci-fi / futurista
  "cyberpunk",
  "sci-fi",
  "science-fiction",
  "futuristic",
  "space",
  "space-sim",
  "space-combat",
  "aliens",
  "robots",
  "mechs",
  "dystopian",
  "post-apocalyptic",
  "time-travel",

  // fantasia / medieval
  "fantasy",
  "dark-fantasy",
  "magic",
  "medieval",
  "dragons",
  "mythology",
  "swordplay",
  "souls-like",

  // horror / tensão
  "horror",
  "survival-horror",
  "psychological-horror",
  "psychological",
  "thriller",
  "mystery",
  "detective",
  "zombies",
  "survival",
  "stealth",
  "atmospheric",
  "dark",
  "gothic",
  "violent",

  // ação / aventura
  "action",
  "action-rpg",
  "adventure",
  "exploration",
  "open-world",
  "sandbox",
  "immersive-sim",
  "parkour",
  "platformer",
  "shooter",
  "third-person-shooter",
  "first-person-shooter",
  "hack-and-slash",
  "beat-em-up",

  // narrativa / drama
  "story-rich",
  "choices-matter",
  "emotional",
  "cinematic",
  "drama",
  "romance",
  "character-driven",

  // crime / realismo
  "western",
  "crime",
  "heist",
  "noir",
  "military",
  "war",
  "historical",

  // anime / japonês
  "anime",
  "jrpg",
  "martial-arts",
  "samurai",
  "ninja",

  // esportivo / corrida
  "racing",
  "sports",
  "driving",

  // construção de mundo / estratégia temática
  "city-builder",
  "colony-sim",
  "management",
  "politics",
  "resource-management",
]);

const USEFUL_GENRES = new Set([
  "action",
  "adventure",
  "rpg",
  "horror",
  "fantasy",
  "strategy",
  "simulation",
  "sports",
  "racing",
  "casual",
  "indie",
  "massively multiplayer",
]);

const SIGNAL_TO_MOVIE_GENRES: Record<string, string[]> = {
  // sci-fi
  cyberpunk: ["science-fiction", "thriller"],
  "sci-fi": ["science-fiction"],
  "science-fiction": ["science-fiction"],
  futuristic: ["science-fiction"],
  space: ["science-fiction", "adventure"],
  "space-sim": ["science-fiction", "adventure"],
  "space-combat": ["science-fiction", "action"],
  aliens: ["science-fiction", "horror"],
  robots: ["science-fiction", "action"],
  mechs: ["science-fiction", "action"],
  dystopian: ["science-fiction", "thriller", "drama"],
  "post-apocalyptic": ["science-fiction", "thriller", "drama"],
  "time-travel": ["science-fiction", "thriller"],

  // fantasia
  fantasy: ["fantasy", "adventure"],
  "dark-fantasy": ["fantasy", "thriller", "drama"],
  magic: ["fantasy", "adventure"],
  medieval: ["fantasy", "adventure", "drama"],
  dragons: ["fantasy", "adventure"],
  mythology: ["fantasy", "adventure"],
  swordplay: ["action", "adventure"],
  "souls-like": ["fantasy", "thriller", "drama"],

  // horror / mistério
  horror: ["horror", "thriller"],
  "survival-horror": ["horror", "thriller"],
  "psychological-horror": ["horror", "thriller"],
  psychological: ["thriller", "drama"],
  thriller: ["thriller"],
  mystery: ["mystery", "thriller"],
  detective: ["mystery", "thriller", "drama"],
  zombies: ["horror", "thriller"],
  survival: ["thriller", "action"],
  stealth: ["thriller", "action"],
  atmospheric: ["thriller", "drama"],
  dark: ["thriller", "drama"],
  gothic: ["horror", "fantasy"],
  violent: ["action", "thriller"],

  // ação / aventura
  action: ["action"],
  "action-rpg": ["action", "adventure", "fantasy"],
  adventure: ["adventure"],
  exploration: ["adventure"],
  "open-world": ["adventure"],
  sandbox: ["adventure"],
  "immersive-sim": ["thriller", "science-fiction"],
  parkour: ["action", "adventure"],
  platformer: ["adventure", "family"],
  shooter: ["action", "thriller"],
  "third-person-shooter": ["action", "thriller"],
  "first-person-shooter": ["action", "thriller"],
  "hack-and-slash": ["action", "fantasy"],
  "beat-em-up": ["action"],

  // narrativa
  "story-rich": ["drama"],
  "choices-matter": ["drama", "thriller"],
  emotional: ["drama", "romance"],
  cinematic: ["drama", "adventure"],
  drama: ["drama"],
  romance: ["romance", "drama"],
  "character-driven": ["drama"],

  // crime / guerra / western
  western: ["western", "drama"],
  crime: ["crime", "thriller"],
  heist: ["crime", "thriller", "action"],
  noir: ["crime", "mystery", "thriller"],
  military: ["war", "action"],
  war: ["war", "action", "drama"],
  historical: ["history", "drama"],

  // anime / jp
  anime: ["animation", "fantasy", "action"],
  jrpg: ["fantasy", "adventure", "drama"],
  "martial-arts": ["action", "drama"],
  samurai: ["action", "drama", "history"],
  ninja: ["action", "thriller"],

  // corrida / esportes
  racing: ["action"],
  sports: ["drama"],
  driving: ["action", "thriller"],

  // gestão / política
  "city-builder": ["drama"],
  "colony-sim": ["science-fiction", "drama"],
  management: ["drama"],
  politics: ["drama", "thriller"],
  "resource-management": ["drama", "thriller"],

  // genres fallback
  rpg: ["fantasy", "adventure", "drama"],
  strategy: ["war", "drama"],
  simulation: ["drama"],
  casual: ["comedy", "family"],
  indie: ["drama"],
  "massively multiplayer": ["action", "fantasy"],
};

const IRRELEVANT_FALLBACK_TAGS = new Set([
  "singleplayer",
  "multi-player",
  "multiplayer",
  "co-op",
  "online-co-op",
  "online-pvp",
  "pvp",
  "controller",
  "full-controller-support",
  "mouse-only",
  "touch-friendly",
  "steam-achievements",
  "steam-cloud",
  "remote-play-together",
  "family-sharing",
  "level-editor",
  "moddable",
  "character-customization",
  "great-soundtrack",
  "soundtrack",
  "cinematic", // pode manter se quiser; aqui deixei útil acima, então remova daqui se preferir
  "nsfw",
  "nudity",
  "mature",
  "sexual-content",
  "gore",
]);

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function takeUseful(values: string[], allowed: Set<string>, limit: number) {
  return values.filter((value) => allowed.has(value)).slice(0, limit);
}

function takeFallbackTags(values: string[], limit: number) {
  return values
    .filter((value) => !IRRELEVANT_FALLBACK_TAGS.has(value))
    .slice(0, limit);
}

export function buildMovieSignals(profile: UserGameProfile): MovieSignals {
  const tagThemes = takeUseful(profile.topTags, USEFUL_THEME_TAGS, 8);
  const genreThemes = takeUseful(profile.topGenres, USEFUL_GENRES, 3);

  let movieThemes = unique([...tagThemes, ...genreThemes]).slice(0, 8);

  if (movieThemes.length < 5) {
    movieThemes = unique([
      ...movieThemes,
      ...takeFallbackTags(profile.topTags, 6),
    ]).slice(0, 8);
  }

  const movieGenres = unique(
    movieThemes.flatMap((theme) => SIGNAL_TO_MOVIE_GENRES[theme] ?? []),
  ).slice(0, 6);

  const searchTerms = unique(
    [
      movieThemes.slice(0, 3).join(" "),
      movieThemes.slice(0, 4).join(" "),
      movieThemes.slice(0, 5).join(" "),
      `${movieThemes.slice(0, 2).join(" ")} movie`,
      `${movieThemes.slice(0, 3).join(" ")} film`,
      `${movieGenres.slice(0, 2).join(" ")} movie`,
    ].filter((value) => value.trim().length > 0),
  );

  return {
    movieThemes,
    movieGenres,
    searchTerms,
  };
}
