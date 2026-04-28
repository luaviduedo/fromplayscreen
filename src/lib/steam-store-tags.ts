import { AppError } from "@/lib/errors";
import * as cheerio from "cheerio";

function unique(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

export async function getSteamStoreTags(appId: number): Promise<string[]> {
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new AppError("INVALID_APP_ID", 400, "App ID inválido.");
  }

  const url = `https://store.steampowered.com/app/${appId}/?l=english`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Cookie: [
        "wants_mature_content=1",
        "lastagecheckage=1-January-1990",
        "birthtime=631152000",
      ].join("; "),
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError(
      "STEAM_STORE_PAGE_REQUEST_FAILED",
      response.status,
      "Falha ao carregar a página da Steam Store.",
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const tags = unique(
    $("a.app_tag")
      .map((_, element) => $(element).text())
      .get(),
  );

  return tags;
}
