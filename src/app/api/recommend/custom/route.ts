import { AppError, getErrorMessage } from "@/lib/errors";
import { getRecommendedMovies } from "@/lib/tmdb";

type CustomRecommendBody = {
  movieThemes: string[];
  movieGenres: string[];
  searchTerms: string[];
};

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CustomRecommendBody>;

    const movieThemes = ensureStringArray(body.movieThemes);
    const movieGenres = ensureStringArray(body.movieGenres);
    const searchTerms = ensureStringArray(body.searchTerms);

    if (
      movieThemes.length === 0 &&
      movieGenres.length === 0 &&
      searchTerms.length === 0
    ) {
      return Response.json(
        {
          success: false,
          error: {
            code: "EMPTY_SIGNALS",
            message: "Nenhum sinal foi enviado para gerar recomendações.",
          },
        },
        { status: 400 },
      );
    }

    const recommendations = await getRecommendedMovies({
      movieGenres,
      searchTerms,
    });

    return Response.json({
      success: true,
      data: {
        movieThemes,
        movieGenres,
        searchTerms,
        recommendations,
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";

    return Response.json(
      {
        success: false,
        error: {
          code,
          message: getErrorMessage(error),
        },
      },
      { status },
    );
  }
}
