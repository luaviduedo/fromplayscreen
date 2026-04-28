import type { UserGameProfile } from "@/lib/user-game-profile";

export type MovieSignals = {
  movieThemes: string[];
  movieGenres: string[];
  searchTerms: string[];
};

const USEFUL_THEME_TAGS = new Set([
  "cyberpunk",
  "open-world",
  "story-rich",
  "sci-fi",
  "futuristic",
  "atmospheric",
  "exploration",
  "action",
  "action-rpg",
  "adventure",
  "immersive-sim",
  "horror",
  "survival",
  "zombies",
  "post-apocalyptic",
  "fantasy",
  "dark-fantasy",
  "western",
  "mystery",
  "stealth",
  "drama",
  "detective",
  "thriller",
  "psychological-horror",
  "survival-horror",
  "magic",
  "medieval",
  "choices-matter",
]);

const USEFUL_GENRES = new Set([
  "action",
  "adventure",
  "rpg",
  "horror",
  "fantasy",
]);

const SIGNAL_TO_MOVIE_GENRES: Record<string, string[]> = {
  cyberpunk: ["science-fiction", "thriller"],
  "sci-fi": ["science-fiction"],
  futuristic: ["science-fiction"],
  "story-rich": ["drama"],
  "open-world": ["adventure"],
  action: ["action"],
  "action-rpg": ["action", "adventure", "fantasy"],
  adventure: ["adventure"],
  "immersive-sim": ["thriller", "science-fiction"],
  horror: ["horror", "thriller"],
  survival: ["thriller"],
  zombies: ["horror", "thriller"],
  "post-apocalyptic": ["science-fiction", "thriller", "drama"],
  fantasy: ["fantasy", "adventure"],
  "dark-fantasy": ["fantasy", "thriller", "drama"],
  western: ["western", "drama"],
  mystery: ["mystery", "thriller"],
  stealth: ["thriller", "action"],
  drama: ["drama"],
  rpg: ["fantasy", "adventure", "drama"],
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function takeUseful(values: string[], allowed: Set<string>, limit: number) {
  return values.filter((value) => allowed.has(value)).slice(0, limit);
}

export function buildMovieSignals(profile: UserGameProfile): MovieSignals {
  const tagThemes = takeUseful(profile.topTags, USEFUL_THEME_TAGS, 6);
  const genreThemes = takeUseful(profile.topGenres, USEFUL_GENRES, 2);

  let movieThemes = unique([...tagThemes, ...genreThemes]).slice(0, 6);

  if (movieThemes.length < 3) {
    movieThemes = unique([
      ...movieThemes,
      ...profile.topTags
        .filter((tag) => USEFUL_THEME_TAGS.has(tag))
        .slice(0, 3),
      ...profile.topGenres
        .filter((genre) => USEFUL_GENRES.has(genre))
        .slice(0, 2),
    ]).slice(0, 6);
  }

  const movieGenres = unique(
    movieThemes.flatMap((theme) => SIGNAL_TO_MOVIE_GENRES[theme] ?? []),
  );

  const searchTerms = unique(
    [
      movieThemes.slice(0, 3).join(" "),
      movieThemes.slice(0, 4).join(" "),
      `${movieThemes.slice(0, 2).join(" ")} movie`,
      `${movieGenres.slice(0, 2).join(" ")} movie`,
    ].filter((value) => value.trim().length > 0),
  );

  return {
    movieThemes,
    movieGenres,
    searchTerms,
  };
}
