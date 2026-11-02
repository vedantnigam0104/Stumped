import type { Match, MatchState, Scorecard, SeriesGroup, Standing, Team } from '@/types/cricket';

const MAX_OVERS: Record<string, number> = { ODI: 50, T20: 20 };

export function maxOversFor(format: string): number | null {
  return MAX_OVERS[format] ?? null;
}

export function splitMatches(matches: Match[]) {
  const withState = (state: MatchState) => matches.filter((match) => match.state === state);
  return {
    live: withState('live'),
    upcoming: withState('upcoming').sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    completed: withState('completed').sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
  };
}

export function featuredMatch(matches: Match[]): Match | null {
  const { live, completed } = splitMatches(matches);
  return live[0] ?? completed[0] ?? null;
}

export function oversToBalls(overs: number): number {
  const whole = Math.floor(overs);
  const balls = Math.round((overs - whole) * 10);
  return whole * 6 + balls;
}

export function runRate(runs: number, overs: number): number {
  const balls = oversToBalls(overs);
  return balls > 0 ? (runs * 6) / balls : 0;
}

export function requiredRate(format: string, target: number, runs: number, overs: number): number | null {
  const maxOvers = maxOversFor(format);
  if (!maxOvers) return null;
  const remainingBalls = maxOvers * 6 - oversToBalls(overs);
  if (remainingBalls <= 0) return null;
  return Math.max(0, ((target - runs) * 6) / remainingBalls);
}

export function winnerOf(match: Match): Team | null {
  if (match.state !== 'completed') return null;
  const status = match.status.toLowerCase();
  return match.teams.find((team) => status.startsWith(team.name.toLowerCase()) && /\bwon\b/.test(status)) ?? null;
}

export function teamName(match: Match, code: string): string {
  return match.teams.find((team) => team.code === code)?.name ?? code;
}

export function uniqueTeams(matches: Match[]): Team[] {
  const seen = new Map<string, Team>();
  for (const match of matches) {
    for (const team of match.teams) if (!seen.has(team.code)) seen.set(team.code, team);
  }
  return [...seen.values()];
}

export function standingsFrom(matches: Match[]): Standing[] {
  const rows = new Map<string, Standing>();
  const rowFor = (team: Team) => {
    const existing = rows.get(team.code);
    if (existing) return existing;
    const created: Standing = { code: team.code, name: team.name, played: 0, won: 0, lost: 0, points: 0 };
    rows.set(team.code, created);
    return created;
  };

  for (const match of matches) {
    if (match.state !== 'completed') continue;
    for (const team of match.teams) rowFor(team).played += 1;
    const winner = winnerOf(match);
    if (!winner) continue;
    rowFor(winner).won += 1;
    const loser = match.teams.find((team) => team.code !== winner.code);
    if (loser) rowFor(loser).lost += 1;
  }

  return [...rows.values()]
    .map((row) => ({ ...row, points: row.won * 2 }))
    .sort((a, b) => b.points - a.points || b.won - a.won || a.name.localeCompare(b.name));
}

export function seriesGroupsFrom(matches: Match[]): SeriesGroup[] {
  const groups = new Map<string, SeriesGroup>();
  for (const match of matches) {
    const existing = groups.get(match.series);
    const group: SeriesGroup = existing ?? {
      name: match.series,
      format: match.format,
      total: 0,
      live: 0,
      latestAt: match.startsAt,
    };
    group.total += 1;
    if (match.state === 'live') group.live += 1;
    if (match.startsAt > group.latestAt) group.latestAt = match.startsAt;
    groups.set(match.series, group);
  }
  return [...groups.values()].sort((a, b) => b.live - a.live || b.latestAt.localeCompare(a.latestAt));
}

export function scorecardPlayers(scorecard: Scorecard) {
  const batters = scorecard.innings
    .flatMap((innings) =>
      innings.batters
        .filter((batter) => batter.id)
        .map((batter) => ({
          id: batter.id,
          name: batter.name,
          teamCode: innings.code,
          line: `${batter.runs} (${batter.balls})`,
          score: batter.runs,
        })),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const bowlers = scorecard.innings
    .flatMap((innings) =>
      innings.bowlers
        .filter((bowler) => bowler.id)
        .map((bowler) => ({
          id: bowler.id,
          name: bowler.name,
          teamCode: innings.code,
          line: `${bowler.wickets}/${bowler.runs}`,
          score: bowler.wickets,
        })),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const seen = new Set<string>();
  return [...batters, ...bowlers]
    .filter((player) => {
      if (seen.has(player.id)) return false;
      seen.add(player.id);
      return true;
    })
    .map(({ id, name, teamCode, line }) => ({ id, name, teamCode, line }));
}
