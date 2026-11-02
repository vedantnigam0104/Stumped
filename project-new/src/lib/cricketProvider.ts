import type {
  CareerRow,
  InningsScore,
  Match,
  NewsItem,
  PlayerProfile,
  Scorecard,
  ScorecardInnings,
  Team,
} from '@/types/cricket';

// Talks to CricAPI (cricketdata.org) straight from the browser.
const PROVIDER_BASE = 'https://api.cricapi.com/v1';
const NEWS_FEED = 'https://feeds.bbci.co.uk/sport/cricket/rss.xml';
const API_KEY = (import.meta.env.VITE_CRICKET_API_KEY as string | undefined)?.trim() ?? '';

// Cache lifetimes in seconds. They protect the free tier's ~100 calls/day.
const TTL = { matches: 120, scorecard: 90, player: 86_400, news: 900 } as const;

type Rec = Record<string, any>;

const str = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);

const num = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toIso = (input: string): string => {
  if (!input) return '';
  const value = input.replace(' ', 'T');
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

function formatOf(matchType: string): string {
  const type = matchType.toLowerCase();
  if (type === 'test') return 'Test';
  if (type === 'odi') return 'ODI';
  if (type === 't20' || type === 't20i') return 'T20';
  return matchType.toUpperCase() || 'Other';
}

function teamsOf(raw: Rec): Team[] {
  const list: Rec[] = Array.isArray(raw.teamInfo) ? raw.teamInfo : [];
  return list.map((team) => {
    const name = str(team.name);
    return { name, code: str(team.shortname, name.slice(0, 3).toUpperCase()), img: str(team.img) || null };
  });
}

function codeFor(label: string, teams: Team[]): string {
  const match = teams.find((team) => label.startsWith(team.name));
  return match?.code ?? label.slice(0, 3).toUpperCase();
}

function normalizeMatch(raw: Rec): Match {
  const teams = teamsOf(raw);
  const started = raw.matchStarted === true;
  const ended = raw.matchEnded === true;
  const name = str(raw.name);
  const segments = name.split(',').map((part) => part.trim());
  const innings: InningsScore[] = (Array.isArray(raw.score) ? raw.score : []).map((score: Rec) => {
    const label = str(score.inning);
    return { label, code: codeFor(label, teams), runs: num(score.r), wkts: num(score.w), overs: num(score.o) };
  });

  return {
    id: str(raw.id),
    name,
    series: segments.length >= 3 ? segments[segments.length - 1] : 'International',
    format: formatOf(str(raw.matchType)),
    venue: str(raw.venue),
    startsAt: toIso(str(raw.dateTimeGMT)),
    status: str(raw.status),
    state: ended ? 'completed' : started ? 'live' : 'upcoming',
    teams,
    innings,
  };
}

function normalizeScorecard(raw: Rec): Scorecard {
  const teams = teamsOf(raw);
  const innings: ScorecardInnings[] = (Array.isArray(raw.scorecard) ? raw.scorecard : []).map((inning: Rec) => {
    const label = str(inning.inning);
    return {
      label,
      code: codeFor(label, teams),
      runs: num(inning.r),
      wkts: num(inning.w),
      overs: num(inning.o),
      batters: (Array.isArray(inning.batting) ? inning.batting : []).map((entry: Rec) => ({
        id: str(entry.batsman?.id),
        name: str(entry.batsman?.name),
        dismissal: str(entry.dismissal, 'not out'),
        runs: num(entry.r),
        balls: num(entry.b),
        fours: num(entry['4s']),
        sixes: num(entry['6s']),
        strikeRate: num(entry.sr),
      })),
      bowlers: (Array.isArray(inning.bowling) ? inning.bowling : []).map((entry: Rec) => ({
        id: str(entry.bowler?.id),
        name: str(entry.bowler?.name),
        overs: num(entry.o),
        maidens: num(entry.m),
        runs: num(entry.r),
        wickets: num(entry.w),
        economy: num(entry.eco),
      })),
    };
  });

  return { id: str(raw.id), name: str(raw.name), status: str(raw.status), teams, innings };
}

function normalizePlayer(raw: Rec): PlayerProfile {
  const formats: Record<string, CareerRow> = {};
  const stats: Rec[] = Array.isArray(raw.stats) ? raw.stats : [];
  for (const stat of stats) {
    const matchType = str(stat.matchtype).toLowerCase();
    if (!['test', 'odi', 't20i', 't20'].includes(matchType)) continue;
    const format = formatOf(matchType);
    const row = (formats[format] ??= { format, matches: 0, runs: 0, average: 0, wickets: 0, bowlingAverage: 0 });
    const fn = str(stat.fn).toLowerCase();
    const key = str(stat.stat).toLowerCase();
    const value = num(stat.value);
    if (fn === 'batting') {
      if (key === 'matches') row.matches = Math.max(row.matches, value);
      if (key === 'runs') row.runs = value;
      if (key === 'avg') row.average = value;
    }
    if (fn === 'bowling') {
      if (key === 'wkts') row.wickets = value;
      if (key === 'avg') row.bowlingAverage = value;
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

async function loadProvider(path: string, params: Record<string, string>): Promise<Rec> {
  if (!API_KEY) {
    throw new Error('Cricket API key is missing. Add VITE_CRICKET_API_KEY to your .env file and restart the dev server.');
  }
  const url = new URL(`${PROVIDER_BASE}/${path}`);
  url.searchParams.set('apikey', API_KEY);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Provider responded with ${response.status}`);
  const body: Rec = await response.json();
  if (body?.status !== 'success') throw new Error(str(body?.reason, 'Provider error'));
  return body;
}

async function loadMatches(): Promise<Match[]> {
  const body = await loadProvider('currentMatches', { offset: '0' });
  const list: Rec[] = Array.isArray(body.data) ? body.data : [];
  return list.map(normalizeMatch).filter((match) => match.id && match.startsAt);
}

async function loadScorecard(id: string): Promise<Scorecard> {
  const body = await loadProvider('match_scorecard', { id });
  return normalizeScorecard(body.data ?? {});
}

async function loadPlayer(id: string): Promise<PlayerProfile> {
  const body = await loadProvider('players_info', { id });
  return normalizePlayer(body.data ?? {});
}

// BBC's RSS feed does not allow browser requests (no CORS), so it goes through a public proxy.
function newsFromItems(items: { title: string; link: string; published: string }[]): NewsItem[] {
  return items
    .map((item) => {
      let link = '';
      try {
        const parsed = new URL(item.link);
        parsed.search = '';
        link = parsed.toString();
      } catch {
        link = '';
      }
      return { id: link, title: item.title.trim(), url: link, publishedAt: toIso(item.published) };
    })
    .filter((item) => item.url.includes('/sport/cricket/articles/') && item.title)
    .slice(0, 15);
}

async function loadNewsViaRss2Json(): Promise<NewsItem[]> {
  const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(NEWS_FEED)}`);
  if (!response.ok) throw new Error(`News proxy responded with ${response.status}`);
  const body: Rec = await response.json();
  if (body?.status !== 'ok' || !Array.isArray(body.items)) throw new Error('News proxy returned no items');
  return newsFromItems(
    body.items.map((item: Rec) => ({ title: str(item.title), link: str(item.link), published: str(item.pubDate) })),
  );
}

async function loadNewsViaAllOrigins(): Promise<NewsItem[]> {
  const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(NEWS_FEED)}`);
  if (!response.ok) throw new Error(`News proxy responded with ${response.status}`);
  const doc = new DOMParser().parseFromString(await response.text(), 'text/xml');
  const read = (node: Element, tag: string) => node.getElementsByTagName(tag)[0]?.textContent ?? '';
  return newsFromItems(
    Array.from(doc.getElementsByTagName('item')).map((node) => ({
      title: read(node, 'title'),
      link: read(node, 'link'),
      published: new Date(read(node, 'pubDate')).toISOString(),
    })),
  );
}

async function loadNews(): Promise<NewsItem[]> {
  try {
    return await loadNewsViaRss2Json();
  } catch {
    return loadNewsViaAllOrigins();
  }
}

// ---- caching: shared in-flight requests + localStorage so reloads don't burn the daily quota ----

type CacheRow<T> = { payload: T; fetchedAt: number };

const inFlight = new Map<string, Promise<unknown>>();

function readCache<T>(key: string): CacheRow<T> | null {
  try {
    const raw = localStorage.getItem(`cricket:${key}`);
    return raw ? (JSON.parse(raw) as CacheRow<T>) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, payload: T) {
  try {
    localStorage.setItem(`cricket:${key}`, JSON.stringify({ payload, fetchedAt: Date.now() } satisfies CacheRow<T>));
  } catch {
    // storage full or unavailable: skip caching
  }
}

function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  const row = readCache<T>(key);
  if (row && Date.now() - row.fetchedAt < ttlSeconds * 1000) return Promise.resolve(row.payload);

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const request = load()
    .then((payload) => {
      writeCache(key, payload);
      return payload;
    })
    .catch((error: unknown) => {
      if (row) return row.payload; // serve stale data rather than nothing
      throw error;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, request);
  return request;
}

export function getMatches(): Promise<Match[]> {
  return cached('matches', TTL.matches, loadMatches);
}

export function getNews(): Promise<NewsItem[]> {
  return cached('news', TTL.news, loadNews);
}

export function getScorecard(id: string): Promise<Scorecard> {
  return cached(`scorecard:${id}`, TTL.scorecard, () => loadScorecard(id));
}

export function getPlayer(id: string): Promise<PlayerProfile> {
  return cached(`player:${id}`, TTL.player, () => loadPlayer(id));
}
