import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PROVIDER_BASE = "https://api.cricapi.com/v1";
const NEWS_FEED = "https://feeds.bbci.co.uk/sport/cricket/rss.xml";
const ID_PATTERN = /^[A-Za-z0-9-]{1,80}$/;

const TTL = {
  matches: 120,
  scorecard: 90,
  player: 86_400,
  news: 900,
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const num = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toIso = (value: string): string => {
  if (!value) return "";
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

type Rec = Record<string, any>;

function formatOf(matchType: string): string {
  const type = matchType.toLowerCase();
  if (type === "test") return "Test";
  if (type === "odi") return "ODI";
  if (type === "t20" || type === "t20i") return "T20";
  return matchType.toUpperCase() || "Other";
}

function teamsOf(raw: Rec) {
  const list: Rec[] = Array.isArray(raw.teamInfo) ? raw.teamInfo : [];
  return list.map((team) => {
    const name = str(team.name);
    return {
      name,
      code: str(team.shortname, name.slice(0, 3).toUpperCase()),
      img: str(team.img) || null,
    };
  });
}

function codeFor(label: string, teams: { name: string; code: string }[]): string {
  const match = teams.find((team) => label.startsWith(team.name));
  return match?.code ?? label.slice(0, 3).toUpperCase();
}

function normalizeMatch(raw: Rec) {
  const teams = teamsOf(raw);
  const started = raw.matchStarted === true;
  const ended = raw.matchEnded === true;
  const name = str(raw.name);
  const segments = name.split(",").map((part) => part.trim());
  const innings = (Array.isArray(raw.score) ? raw.score : []).map((score: Rec) => {
    const label = str(score.inning);
    return {
      label,
      code: codeFor(label, teams),
      runs: num(score.r),
      wkts: num(score.w),
      overs: num(score.o),
    };
  });

  return {
    id: str(raw.id),
    name,
    series: segments.length >= 3 ? segments[segments.length - 1] : "International",
    format: formatOf(str(raw.matchType)),
    venue: str(raw.venue),
    startsAt: toIso(str(raw.dateTimeGMT)),
    status: str(raw.status),
    state: ended ? "completed" : started ? "live" : "upcoming",
    teams,
    innings,
  };
}

function normalizeScorecard(raw: Rec) {
  const teams = teamsOf(raw);
  const innings = (Array.isArray(raw.scorecard) ? raw.scorecard : []).map((inning: Rec) => {
    const label = str(inning.inning);
    const batters = (Array.isArray(inning.batting) ? inning.batting : []).map((entry: Rec) => ({
      id: str(entry.batsman?.id),
      name: str(entry.batsman?.name),
      dismissal: str(entry.dismissal, "not out"),
      runs: num(entry.r),
      balls: num(entry.b),
      fours: num(entry["4s"]),
      sixes: num(entry["6s"]),
      strikeRate: num(entry.sr),
    }));
    const bowlers = (Array.isArray(inning.bowling) ? inning.bowling : []).map((entry: Rec) => ({
      id: str(entry.bowler?.id),
      name: str(entry.bowler?.name),
      overs: num(entry.o),
      maidens: num(entry.m),
      runs: num(entry.r),
      wickets: num(entry.w),
      economy: num(entry.eco),
    }));
    return {
      label,
      code: codeFor(label, teams),
      runs: num(inning.r),
      wkts: num(inning.w),
      overs: num(inning.o),
      batters,
      bowlers,
    };
  });

  return {
    id: str(raw.id),
    name: str(raw.name),
    status: str(raw.status),
    teams,
    innings,
  };
}

function normalizePlayer(raw: Rec) {
  const formats: Record<string, { format: string; matches: number; runs: number; average: number; wickets: number; bowlingAverage: number }> = {};
  const stats: Rec[] = Array.isArray(raw.stats) ? raw.stats : [];
  for (const stat of stats) {
    const matchType = str(stat.matchtype).toLowerCase();
    if (!["test", "odi", "t20i", "t20"].includes(matchType)) continue;
    const format = formatOf(matchType);
    const row = (formats[format] ??= {
      format,
      matches: 0,
      runs: 0,
      average: 0,
      wickets: 0,
      bowlingAverage: 0,
    });
    const fn = str(stat.fn).toLowerCase();
    const key = str(stat.stat).toLowerCase();
    const value = num(stat.value);
    if (fn === "batting") {
      if (key === "matches") row.matches = Math.max(row.matches, value);
      if (key === "runs") row.runs = value;
      if (key === "avg") row.average = value;
    }
    if (fn === "bowling") {
      if (key === "wkts") row.wickets = value;
      if (key === "avg") row.bowlingAverage = value;
    }
  }

  return {
    id: str(raw.id),
    name: str(raw.name),
    role: str(raw.role),
    battingStyle: str(raw.battingStyle),
    bowlingStyle: str(raw.bowlingStyle),
    country: str(raw.country),
    dateOfBirth: str(raw.dateOfBirth),
    image: str(raw.placeholderImg) || null,
    career: Object.values(formats),
  };
}

function decodeEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return match ? decodeEntities(match[1]) : "";
}

async function savedApiKey(): Promise<string | null> {
  const { data, error } = await supabase
    .from("cricket_settings")
    .select("api_key")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error("Settings read failed");
  return data?.api_key ?? null;
}

async function loadProvider(path: string, params: Record<string, string>) {
  const apiKey = await savedApiKey();
  if (!apiKey) throw new HttpError(503, "Cricket data is not connected yet.");

  const url = new URL(`${PROVIDER_BASE}/${path}`);
  url.searchParams.set("apikey", apiKey);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Provider responded with ${response.status}`);
  const body = await response.json();
  if (body?.status !== "success") throw new Error(str(body?.reason, "Provider error"));
  return body;
}

async function loadMatches() {
  const body = await loadProvider("currentMatches", { offset: "0" });
  const list: Rec[] = Array.isArray(body.data) ? body.data : [];
  return list.map(normalizeMatch).filter((match) => match.id && match.startsAt);
}

async function loadScorecard(id: string) {
  const body = await loadProvider("match_scorecard", { id });
  return normalizeScorecard(body.data ?? {});
}

async function loadPlayer(id: string) {
  const body = await loadProvider("players_info", { id });
  return normalizePlayer(body.data ?? {});
}

async function loadNews() {
  const response = await fetch(NEWS_FEED);
  if (!response.ok) throw new Error(`News feed responded with ${response.status}`);
  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
  return items
    .map((block) => {
      const rawLink = tag(block, "link");
      let link = rawLink;
      try {
        const parsed = new URL(rawLink);
        parsed.search = "";
        link = parsed.toString();
      } catch {
        link = "";
      }
      const published = new Date(tag(block, "pubDate"));
      return {
        id: link,
        title: tag(block, "title"),
        url: link,
        publishedAt: Number.isNaN(published.getTime()) ? "" : published.toISOString(),
      };
    })
    .filter((item) => item.url.includes("/sport/cricket/articles/") && item.title)
    .slice(0, 15);
}

async function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  const { data: row, error: readError } = await supabase
    .from("cricket_cache")
    .select("payload, fetched_at")
    .eq("cache_key", key)
    .maybeSingle();
  if (readError) throw new Error("Cache read failed");

  const fresh = row && Date.now() - new Date(row.fetched_at).getTime() < ttlSeconds * 1000;
  if (row && fresh) return row.payload as T;

  let payload: T;
  try {
    payload = await load();
  } catch (error) {
    if (row) return row.payload as T;
    throw error;
  }

  const { error: writeError } = await supabase
    .from("cricket_cache")
    .upsert({ cache_key: key, payload, fetched_at: new Date().toISOString() });
  if (writeError) throw new Error("Cache write failed");
  return payload;
}

async function settingsStatus() {
  const apiKey = await savedApiKey();
  return { configured: apiKey !== null, hint: apiKey ? apiKey.slice(-4) : null };
}

async function saveSettings(req: Request) {
  const body = await req.json().catch(() => null);
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
  if (apiKey.length < 8 || apiKey.length > 200 || /\s/.test(apiKey)) {
    throw new HttpError(400, "Enter the full API key from your provider.");
  }

  const { error } = await supabase
    .from("cricket_settings")
    .upsert({ id: 1, api_key: apiKey, updated_at: new Date().toISOString() });
  if (error) throw new Error("Settings write failed");
  return { configured: true, hint: apiKey.slice(-4) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get("resource");
    const id = url.searchParams.get("id") ?? "";

    if (resource === "settings") {
      if (req.method === "POST") return json(await saveSettings(req));
      return json(await settingsStatus());
    }
    if (resource === "matches") {
      return json(await cached("matches", TTL.matches, loadMatches));
    }
    if (resource === "news") {
      return json(await cached("news", TTL.news, loadNews));
    }
    if (resource === "scorecard" || resource === "player") {
      if (!ID_PATTERN.test(id)) return json({ error: "Invalid id." }, 400);
      if (resource === "scorecard") {
        return json(await cached(`scorecard:${id}`, TTL.scorecard, () => loadScorecard(id)));
      }
      return json(await cached(`player:${id}`, TTL.player, () => loadPlayer(id)));
    }
    return json({ error: "Unknown resource." }, 400);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : "Cricket data is unavailable right now.";
    console.error("cricket-data failed:", error instanceof Error ? error.message : error);
    return json({ error: message }, status);
  }
});
