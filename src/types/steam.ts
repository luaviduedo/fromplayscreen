export type SteamRecentGame = {
  appid: number;
  name: string;
  playtime_2weeks?: number;
  playtime_forever?: number;
  img_icon_url?: string;
  img_logo_url?: string;
};

export type SteamRecentGamesResponse = {
  response: {
    total_count?: number;
    games?: SteamRecentGame[];
  };
};

export type SteamOwnedGame = {
  appid: number;
  name?: string;
  playtime_forever: number;
  img_icon_url?: string;
  img_logo_url?: string;
};

export type SteamOwnedGamesResponse = {
  response: {
    game_count?: number;
    games?: SteamOwnedGame[];
  };
};

export type NormalizedSteamGame = {
  appId: number;
  name: string;
  minutesLast2Weeks?: number;
  minutesTotal: number;
  iconUrl: string | null;
  logoUrl: string | null;
};
