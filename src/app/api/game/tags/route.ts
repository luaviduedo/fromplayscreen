import { AppError, getErrorMessage } from "@/lib/errors";
import { getSteamStoreTags } from "@/lib/steam-store-tags";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appIdParam = searchParams.get("appId");
    const appId = Number(appIdParam);

    if (!Number.isInteger(appId) || appId <= 0) {
      return Response.json(
        {
          success: false,
          error: {
            code: "INVALID_APP_ID",
            message: "App ID inválido.",
          },
        },
        { status: 400 },
      );
    }

    const tags = await getSteamStoreTags(appId);

    return Response.json({
      success: true,
      data: {
        appId,
        tags,
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
