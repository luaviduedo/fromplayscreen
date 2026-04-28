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
  comedy: 35,
  drama: 18,
  fantasy: 14,
  horror: 27,
  mystery: 9648,
  "science-fiction": 878,
  thriller: 53,
  western: 37,
};

function mapGenresToIds(genres: string[]) {
  return genres
    .map((genre) => MOVIE_GENRE_MAP[genre])
    .filter((id): id is number => Boolean(id));
}

function normalizeMovie(movie: TmdbMovie) {
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

export async function discoverMoviesByGenres(genres: string[]) {
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
  url.searchParams.set("with_genres", genreIds.join(","));
  url.searchParams.set("vote_count.gte", "200");

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

export async function searchMoviesByTerms(searchTerms: string[]) {
  ensureTmdbApiKey();

  const results: ReturnType<typeof normalizeMovie>[] = [];

  for (const term of searchTerms.slice(0, 3)) {
    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.set("api_key", TMDB_API_KEY as string);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("query", term);
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
}) {
  const [genreMovies, searchMovies] = await Promise.all([
    discoverMoviesByGenres(params.movieGenres),
    searchMoviesByTerms(params.searchTerms),
  ]);

  const merged = uniqueById([...genreMovies, ...searchMovies]);

  return merged.sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 10);
}
