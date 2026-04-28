import { AppError } from "@/lib/errors";
import type {
  NormalizedSteamGame,
  SteamOwnedGamesResponse,
  SteamRecentGamesResponse,
} from "@/types/steam";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

function ensureSteamApiKey() {
  if (!STEAM_API_KEY) {
    throw new AppError(
      "MISSING_STEAM_API_KEY",
      500,
      "A chave da Steam não foi configurada no ambiente.",
    );
  }
}

function ensureSteamId(steamId: string) {
  if (!steamId) {
    throw new AppError("INVALID_STEAM_ID", 400, "Steam ID não informado.");
  }
}

export async function getRecentlyPlayedGames(
  steamId: string,
  count = 5,
): Promise<NormalizedSteamGame[]> {
  ensureSteamApiKey();
  ensureSteamId(steamId);

  const url = new URL(
    "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/",
  );

  url.searchParams.set("key", STEAM_API_KEY as string);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("count", String(count));
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError(
      "STEAM_RECENT_REQUEST_FAILED",
      response.status,
      "Falha ao buscar jogos recentes na Steam.",
    );
  }

  const data = (await response.json()) as SteamRecentGamesResponse;
  const games = data.response.games ?? [];

  return games.map((game) => ({
    appId: game.appid,
    name: game.name,
    minutesLast2Weeks: game.playtime_2weeks ?? 0,
    minutesTotal: game.playtime_forever ?? 0,
    iconUrl: game.img_icon_url ?? null,
    logoUrl: game.img_logo_url ?? null,
  }));
}

export async function getTopPlayedGames(
  steamId: string,
  count = 5,
): Promise<NormalizedSteamGame[]> {
  ensureSteamApiKey();
  ensureSteamId(steamId);

  const url = new URL(
    "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
  );

  url.searchParams.set("key", STEAM_API_KEY as string);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("include_appinfo", "true");
  url.searchParams.set("include_played_free_games", "true");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError(
      "STEAM_OWNED_REQUEST_FAILED",
      response.status,
      "Falha ao buscar jogos do usuário na Steam.",
    );
  }

  const data = (await response.json()) as SteamOwnedGamesResponse;
  const games = data.response.games ?? [];

  return games
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, count)
    .map((game) => ({
      appId: game.appid,
      name: game.name ?? "Jogo sem nome",
      minutesTotal: game.playtime_forever ?? 0,
      iconUrl: game.img_icon_url ?? null,
      logoUrl: game.img_logo_url ?? null,
    }));
}
