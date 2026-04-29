import { AppError } from "@/lib/errors";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const MIN_VOTE_AVERAGE = 6.8;
const MIN_VOTE_COUNT = 120;

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
};

type DiscoverMoviesResponse = {
  results: TmdbMovie[];
};

type SearchMoviesResponse = {
  results: TmdbMovie[];
};

type KeywordSearchResponse = {
  results: {
    id: number;
    name: string;
  }[];
};

export type RecommendedMovie = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  score?: number;
};

function ensureTmdbApiKey() {
  if (!TMDB_API_KEY) {
    throw new AppError(
      "MISSING_TMDB_API_KEY",
      500,
      "A chave do TMDb não foi configurada.",
    );
  }
}

const MOVIE_GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "science-fiction": 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

function mapGenresToIds(genres: string[]) {
  return genres
    .map((genre) => MOVIE_GENRE_MAP[genre])
    .filter((id): id is number => Boolean(id));
}

function normalizeTerms(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)),
  );
}

function normalizeMovie(movie: TmdbMovie): RecommendedMovie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    genreIds: movie.genre_ids,
  };
}

function uniqueById<T extends { id: number }>(items: T[]) {
  const map = new Map<number, T>();

  for (const item of items) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError(
      "TMDB_REQUEST_FAILED",
      response.status,
      "Falha ao consultar o TMDb.",
    );
  }

  return response.json() as Promise<T>;
}

function buildSearchQueue(searchTerms: string[], keywordCandidates: string[]) {
  const normalizedKeywords = normalizeTerms(keywordCandidates);
  const normalizedSearchTerms = normalizeTerms(searchTerms);

  const exactKeywordQueries = normalizedKeywords.flatMap((keyword) => [
    keyword,
    `${keyword} movie`,
    `${keyword} film`,
  ]);

  const pairedKeywordQueries: string[] = [];

  for (let i = 0; i < Math.min(normalizedKeywords.length, 5); i += 1) {
    for (let j = i + 1; j < Math.min(normalizedKeywords.length, 5); j += 1) {
      pairedKeywordQueries.push(
        `${normalizedKeywords[i]} ${normalizedKeywords[j]}`,
      );
      pairedKeywordQueries.push(
        `${normalizedKeywords[i]} ${normalizedKeywords[j]} movie`,
      );
    }
  }

  return normalizeTerms([
    ...exactKeywordQueries,
    ...pairedKeywordQueries,
    ...normalizedSearchTerms,
  ]).slice(0, 16);
}

async function searchKeywordIds(
  keywordCandidates: string[],
): Promise<number[]> {
  ensureTmdbApiKey();

  const ids: number[] = [];
  const normalizedKeywords = normalizeTerms(keywordCandidates).slice(0, 12);

  for (const keyword of normalizedKeywords) {
    const url = new URL(`${TMDB_BASE_URL}/search/keyword`);
    url.searchParams.set("api_key", TMDB_API_KEY as string);
    url.searchParams.set("query", keyword);
    url.searchParams.set("page", "1");

    const data = await fetchJson<KeywordSearchResponse>(url);

    const exact = data.results.find(
      (item) => item.name.trim().toLowerCase() === keyword,
    );

    if (exact) {
      ids.push(exact.id);
      continue;
    }

    const partial = data.results[0];
    if (partial) {
      ids.push(partial.id);
    }
  }

  return Array.from(new Set(ids));
}

async function discoverMoviesByGenres(
  genres: string[],
): Promise<RecommendedMovie[]> {
  ensureTmdbApiKey();

  const genreIds = mapGenresToIds(genres);
  if (genreIds.length === 0) return [];

  const url = new URL(`${TMDB_BASE_URL}/discover/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY as string);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("include_video", "false");
  url.searchParams.set("page", "1");
  url.searchParams.set("with_genres", genreIds.join("|"));
  url.searchParams.set("vote_count.gte", "20");

  const data = await fetchJson<DiscoverMoviesResponse>(url);
  return data.results.map(normalizeMovie);
}

async function discoverMoviesByKeywords(
  keywordCandidates: string[],
): Promise<RecommendedMovie[]> {
  ensureTmdbApiKey();

  const keywordIds = await searchKeywordIds(keywordCandidates);
  if (keywordIds.length === 0) return [];

  const url = new URL(`${TMDB_BASE_URL}/discover/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY as string);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("include_video", "false");
  url.searchParams.set("page", "1");
  url.searchParams.set("with_keywords", keywordIds.join("|"));
  url.searchParams.set("vote_count.gte", "8");

  const data = await fetchJson<DiscoverMoviesResponse>(url);
  return data.results.map(normalizeMovie);
}

async function discoverMoviesByGenresAndKeywords(params: {
  genres: string[];
  keywordCandidates: string[];
}): Promise<RecommendedMovie[]> {
  ensureTmdbApiKey();

  const genreIds = mapGenresToIds(params.genres);
  const keywordIds = await searchKeywordIds(params.keywordCandidates);

  if (genreIds.length === 0 || keywordIds.length === 0) {
    return [];
  }

  const url = new URL(`${TMDB_BASE_URL}/discover/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY as string);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("include_video", "false");
  url.searchParams.set("page", "1");
  url.searchParams.set("with_genres", genreIds.join("|"));
  url.searchParams.set("with_keywords", keywordIds.join("|"));
  url.searchParams.set("vote_count.gte", "8");

  const data = await fetchJson<DiscoverMoviesResponse>(url);
  return data.results.map(normalizeMovie);
}

async function searchMoviesByTerms(
  searchTerms: string[],
  keywordCandidates: string[],
): Promise<RecommendedMovie[]> {
  ensureTmdbApiKey();

  const results: RecommendedMovie[] = [];
  const searchQueue = buildSearchQueue(searchTerms, keywordCandidates);

  for (const term of searchQueue) {
    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.set("api_key", TMDB_API_KEY as string);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("query", term);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("page", "1");

    const data = await fetchJson<SearchMoviesResponse>(url);
    results.push(...data.results.map(normalizeMovie));
  }

  return uniqueById(results);
}

function countHits(text: string, values: string[]) {
  const normalizedText = text.toLowerCase();
  let hits = 0;

  for (const value of values) {
    const normalizedValue = value.toLowerCase();
    if (normalizedValue && normalizedText.includes(normalizedValue)) {
      hits += 1;
    }
  }

  return hits;
}

function scoreMovie(
  movie: RecommendedMovie,
  genreIds: number[],
  keywordCandidates: string[],
  sourceSets: {
    fromGenre: Set<number>;
    fromKeyword: Set<number>;
    fromGenreKeyword: Set<number>;
    fromSearch: Set<number>;
  },
) {
  let score = 0;

  const normalizedKeywords = normalizeTerms(keywordCandidates);

  const genreOverlap = movie.genreIds.filter((id) =>
    genreIds.includes(id),
  ).length;
  score += genreOverlap * 1.25;

  if (sourceSets.fromGenreKeyword.has(movie.id)) score += 20;
  if (sourceSets.fromKeyword.has(movie.id)) score += 16;
  if (sourceSets.fromSearch.has(movie.id)) score += 7;
  if (sourceSets.fromGenre.has(movie.id)) score += 1;

  const titleHits = countHits(movie.title, normalizedKeywords);
  const overviewHits = countHits(movie.overview, normalizedKeywords);

  score += titleHits * 12;
  score += overviewHits * 5;

  if (
    sourceSets.fromGenre.has(movie.id) &&
    !sourceSets.fromKeyword.has(movie.id) &&
    !sourceSets.fromGenreKeyword.has(movie.id) &&
    titleHits === 0 &&
    overviewHits === 0
  ) {
    score -= 10;
  }

  score += Math.min(movie.voteAverage, 10) * 1.1;
  score += Math.min(movie.voteCount / 250, 4);
  score += Math.min(movie.popularity / 100, 2);

  return score;
}

export async function getRecommendedMovies(params: {
  movieGenres: string[];
  searchTerms: string[];
  keywordCandidates?: string[];
}): Promise<RecommendedMovie[]> {
  const keywordCandidates = normalizeTerms(
    params.keywordCandidates ?? [],
  ).slice(0, 12);
  const genreIds = mapGenresToIds(params.movieGenres);

  const [genreMovies, keywordMovies, genreKeywordMovies, searchMovies] =
    await Promise.all([
      discoverMoviesByGenres(params.movieGenres),
      discoverMoviesByKeywords(keywordCandidates),
      discoverMoviesByGenresAndKeywords({
        genres: params.movieGenres,
        keywordCandidates,
      }),
      searchMoviesByTerms(params.searchTerms, keywordCandidates),
    ]);

  const fromGenre = new Set(genreMovies.map((movie) => movie.id));
  const fromKeyword = new Set(keywordMovies.map((movie) => movie.id));
  const fromGenreKeyword = new Set(genreKeywordMovies.map((movie) => movie.id));
  const fromSearch = new Set(searchMovies.map((movie) => movie.id));

  const merged = uniqueById([
    ...genreKeywordMovies,
    ...keywordMovies,
    ...searchMovies,
    ...genreMovies,
  ]);

  return merged
    .filter(
      (movie) =>
        movie.voteAverage >= MIN_VOTE_AVERAGE &&
        movie.voteCount >= MIN_VOTE_COUNT,
    )
    .map((movie) => ({
      ...movie,
      score: scoreMovie(movie, genreIds, keywordCandidates, {
        fromGenre,
        fromKeyword,
        fromGenreKeyword,
        fromSearch,
      }),
    }))
    .sort((a, b) => {
      if ((b.score ?? 0) !== (a.score ?? 0)) {
        return (b.score ?? 0) - (a.score ?? 0);
      }

      return (b.releaseDate || "").localeCompare(a.releaseDate || "");
    })
    .slice(0, 16);
}
