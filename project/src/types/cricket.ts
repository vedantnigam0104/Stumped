export type MatchState = 'live' | 'upcoming' | 'completed';

export type Team = { name: string; code: string; img: string | null };

export type InningsScore = { label: string; code: string; runs: number; wkts: number; overs: number };

export type Match = {
  id: string;
  name: string;
  series: string;
  format: string;
  venue: string;
  startsAt: string;
  status: string;
  state: MatchState;
  teams: Team[];
  innings: InningsScore[];
};

export type Batter = {
  id: string;
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
};

export type Bowler = {
  id: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
};

export type ScorecardInnings = InningsScore & { batters: Batter[]; bowlers: Bowler[] };

export type Scorecard = { id: string; name: string; status: string; teams: Team[]; innings: ScorecardInnings[] };

export type CareerRow = {
  format: string;
  matches: number;
  runs: number;
  average: number;
  wickets: number;
  bowlingAverage: number;
};

export type PlayerProfile = {
  id: string;
  name: string;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  country: string;
  dateOfBirth: string;
  image: string | null;
  career: CareerRow[];
};

export type NewsItem = { id: string; title: string; url: string; publishedAt: string };

export type Standing = { code: string; name: string; played: number; won: number; lost: number; points: number };

export type SeriesGroup = { name: string; format: string; total: number; live: number; latestAt: string };

export type FeedPlayer = { id: string; name: string; teamCode: string; line: string };
