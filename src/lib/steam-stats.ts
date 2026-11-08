import { cached } from "@/lib/ttl-cache";

const STEAM_API = "https://api.steampowered.com";
const STEAMWEBAPI = "https://www.steamwebapi.com/steam/api";

interface SteamWebApiGamesResponse {
  gamesvisible?: boolean;
  perfectgamescount?: number;
}

export interface SteamStats {
  profileUrl: string;
  totalGames: number;
  totalHours: number;
  perfectGames: number;
  games: SteamGame[];
}

export interface SteamGame {
  appid: number;
  name: string;
  playtimeTwoWeeks: number;
  playtimeForever: number;
  iconUrl: string;
}

interface SteamRecentResponse {
  response?:  {
    games?: {
      appid: number;
      name: string;
      playtime_2weeks?: number;
      playtime_forever?: number;
      img_icon_url?: string;
    }[];
  };
}

interface SteamOwnedResponse {
  response?: {
    game_count?: number;
    games?: {
      appid: number;
      name?: string;
      playtime_forever?: number;
      playtime_2weeks?: number;
      img_icon_url?: string;
      has_community_visible_stats?: boolean;
    }[];
  };
}

async function loadPerfectGames(): Promise<number | null> {
  const key = process.env.STEAMWEBAPI_KEY;
  const steamid = process.env.STEAM_ID;

  if (!key || !steamid) return null;

  try {
    const url = new URL(`${STEAMWEBAPI}/profile/games`);
    url.searchParams.set("id", steamid);
    url.searchParams.set("key", key);

    const response = await fetch(url, {
      next: { revalidate: 6 * 60 * 60 },
      signal: AbortSignal.timeout(5_000)
    });

    if (!response.ok) return null;

    const data = (await response.json()) as SteamWebApiGamesResponse;

    if (data.gamesvisible === false) return null;
    if (typeof data.perfectgamescount !== "number") return null;
    return data.perfectgamescount;
  } catch {
    return null;
  }
}

export function fetchSteamStats(): Promise<SteamStats | null> {
  return cached("steam:stats", loadSteamStats, 15 * 60 * 1000);
}

function fetchPerfectGames() {
  return cached("steam:perfect", loadPerfectGames, 6 * 60 * 60 * 1000);
}

async function loadSteamStats(): Promise<SteamStats | null> {
  const key = process.env.STEAM_API_KEY;
  const steamid = process.env.STEAM_ID; 

  if (!key || !steamid) return null;

  const recentUrl = new URL(`${STEAM_API}/IPlayerService/GetRecentlyPlayedGames/v0001/`);
  recentUrl.searchParams.set("key", key);
  recentUrl.searchParams.set("steamid", steamid);
  recentUrl.searchParams.set("count", "5");
  recentUrl.searchParams.set("format", "json");

  const ownedUrl = new URL(`${STEAM_API}/IPlayerService/GetOwnedGames/v0001/`);
  ownedUrl.searchParams.set("key", key);
  ownedUrl.searchParams.set("steamid", steamid);
  ownedUrl.searchParams.set("include_appinfo", "1");
  ownedUrl.searchParams.set("format", "json");

  try {
    const [recentResponse, ownedResponse, perfectGames] = await Promise.all([
      fetch(recentUrl, { next: { revalidate: 900 } }),
      fetch(ownedUrl, { next: { revalidate: 900 } }),
      fetchPerfectGames()
    ]);

    if (!ownedResponse.ok) return null;

    const ownedData = (await ownedResponse.json()) as SteamOwnedResponse;
    const ownedGames = ownedData.response?.games ?? [];

    const totalMinutes = ownedGames.reduce(
      (total, game) => total + (game.playtime_forever ?? 0),
      0
    );
    const totalGames = ownedData.response?.game_count ?? ownedGames.length;

    const recentData = recentResponse.ok ? ((await recentResponse.json()) as SteamRecentResponse) : null;
    const recentGames = recentData?.response?.games ?? [];

    return {
      profileUrl: `https://steamcommunity.com/profiles/${steamid}`,
      totalGames,
      totalHours: Math.round(totalMinutes / 60),
      perfectGames: perfectGames ?? 0,
      games: recentGames.map((game) => ({
        appid: game.appid,
        name: game.name,
        playtimeTwoWeeks: game.playtime_2weeks ?? 0,
        playtimeForever: game.playtime_forever ?? 0,
        iconUrl: game.img_icon_url ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg` : ""
      })),
    };
  } catch {
    return null;
  }
}