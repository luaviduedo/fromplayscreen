export type SteamStoreGenre = {
  id?: string;
  description: string;
};

export type SteamStoreCategory = {
  id?: number;
  description: string;
};

export type GameMetadata = {
  appId: number;
  name: string;
  genres: string[];
  categories: string[];
  shortDescription: string | null;
  detailedDescription: string | null;
  type: string | null;
  developers: string[];
  publishers: string[];
  tags: string[];
};
