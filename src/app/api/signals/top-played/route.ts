import { AppError, getErrorMessage } from "@/lib/errors";
import { buildMovieSignals } from "@/lib/movie-signals";
import { buildUserGameProfile } from "@/lib/user-game-profile";
import { getTopPlayedGames } from "@/lib/steam";
import { steamIdSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get("steamId");

    const parsed = steamIdSchema.safeParse({ steamId });

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: {
            code: "INVALID_STEAM_ID",
            message: parsed.error.issues[0]?.message ?? "Steam ID inválido.",
          },
        },
        { status: 400 },
      );
    }

    const games = await getTopPlayedGames(parsed.data.steamId, 5);
    const profile = await buildUserGameProfile(games);
    const signals = buildMovieSignals(profile);

    return Response.json({
      success: true,
      data: {
        profile,
        signals,
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
