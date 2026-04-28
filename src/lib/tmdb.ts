import { AppError } from "@/lib/errors";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
};

type DiscoverMoviesResponse = {
  results: TmdbMovie[];
};

type SearchMoviesResponse = {
  results: TmdbMovie[];
};

export type RecommendedMovie = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
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

function normalizeMovie(movie: TmdbMovie): RecommendedMovie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
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

export async function discoverMoviesByGenres(
  genres: string[],
): Promise<RecommendedMovie[]> {
  ensureTmdbApiKey();

  const genreIds = mapGenresToIds(genres);

  if (genreIds.length === 0) {
    return [];
  }

  const url = new URL(`${TMDB_BASE_URL}/discover/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY as string);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("include_video", "false");
  url.searchParams.set("page", "1");

  // IMPORTANTE:
  // pipe = OR
  // vírgula = AND
  // Para recomendação, OR faz bem mais sentido.
  url.searchParams.set("with_genres", genreIds.join("|"));

  // Menos restritivo para trazer mais resultados
  url.searchParams.set("vote_count.gte", "50");

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError(
      "TMDB_DISCOVER_FAILED",
      response.status,
      "Falha ao buscar filmes por gênero no TMDb.",
    );
  }

  const data = (await response.json()) as DiscoverMoviesResponse;
  return data.results.map(normalizeMovie);
}

export async function searchMoviesByTerms(
  searchTerms: string[],
): Promise<RecommendedMovie[]> {
  ensureTmdbApiKey();

  const results: RecommendedMovie[] = [];

  for (const term of searchTerms.slice(0, 4)) {
    const cleanedTerm = term.trim();

    if (!cleanedTerm) continue;

    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.set("api_key", TMDB_API_KEY as string);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("query", cleanedTerm);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("page", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new AppError(
        "TMDB_SEARCH_FAILED",
        response.status,
        "Falha ao buscar filmes por termo no TMDb.",
      );
    }

    const data = (await response.json()) as SearchMoviesResponse;
    results.push(...data.results.map(normalizeMovie));
  }

  return uniqueById(results);
}

export async function getRecommendedMovies(params: {
  movieGenres: string[];
  searchTerms: string[];
}): Promise<RecommendedMovie[]> {
  const [genreMovies, searchMovies] = await Promise.all([
    discoverMoviesByGenres(params.movieGenres),
    searchMoviesByTerms(params.searchTerms),
  ]);

  // Prioriza os resultados por busca textual primeiro
  const merged = uniqueById([...searchMovies, ...genreMovies]);

  return merged
    .filter((movie) => movie.voteAverage > 0)
    .sort((a, b) => {
      if (b.voteAverage !== a.voteAverage) {
        return b.voteAverage - a.voteAverage;
      }

      return (b.releaseDate || "").localeCompare(a.releaseDate || "");
    })
    .slice(0, 12);
}
