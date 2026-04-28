import { AppError } from "@/lib/errors";
import type {
  GameMetadata,
  SteamStoreCategory,
  SteamStoreGenre,
} from "@/types/game-metadata";

type SteamAppDetailsSuccess = {
  success: true;
  data: {
    type?: string;
    steam_appid: number;
    name: string;
    short_description?: string;
    detailed_description?: string;
    developers?: string[];
    publishers?: string[];
    genres?: SteamStoreGenre[];
    categories?: SteamStoreCategory[];
  };
};

type SteamAppDetailsFailure = {
  success: false;
};

type SteamAppDetailsResponse = Record<
  string,
  SteamAppDetailsSuccess | SteamAppDetailsFailure
>;

const RELEVANT_CATEGORIES = new Set([
  "Single-player",
  "Multi-player",
  "Online Co-op",
  "Co-op",
  "Online PvP",
  "PvP",
  "Shared/Split Screen",
  "Shared/Split Screen Co-op",
  "Shared/Split Screen PvP",
  "MMO",
]);

function normalizeList(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function filterRelevantCategories(categories: string[]) {
  return categories.filter((category) => RELEVANT_CATEGORIES.has(category));
}

export async function getGameMetadata(appId: number): Promise<GameMetadata> {
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new AppError("INVALID_APP_ID", 400, "App ID inválido.");
  }

  const url = new URL("https://store.steampowered.com/api/appdetails");
  url.searchParams.set("appids", String(appId));
  url.searchParams.set("l", "english");

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError(
      "STEAM_STORE_REQUEST_FAILED",
      response.status,
      "Falha ao buscar metadados do jogo na Steam.",
    );
  }

  const json = (await response.json()) as SteamAppDetailsResponse;
  const entry = json[String(appId)];

  if (!entry || !entry.success) {
    throw new AppError(
      "STEAM_APP_NOT_FOUND",
      404,
      "Não foi possível obter os metadados desse jogo.",
    );
  }

  const genres = normalizeList(
    (entry.data.genres ?? []).map((genre) => genre.description),
  );

  const rawCategories = normalizeList(
    (entry.data.categories ?? []).map((category) => category.description),
  );

  return {
    appId: entry.data.steam_appid,
    name: entry.data.name,
    genres,
    categories: filterRelevantCategories(rawCategories),
    shortDescription: entry.data.short_description ?? null,
    detailedDescription: entry.data.detailed_description ?? null,
    type: entry.data.type ?? null,
    developers: normalizeList(entry.data.developers ?? []),
    publishers: normalizeList(entry.data.publishers ?? []),
    tags: [],
  };
}
