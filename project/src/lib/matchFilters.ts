import type { Match } from '@/types/cricket';

export type FormatFilter = 'All' | 'Test' | 'ODI' | 'T20';

export function passesFilters(match: Pick<Match, 'format' | 'series' | 'venue' | 'teams'>, query: string, format: FormatFilter) {
  if (format !== 'All' && match.format !== format) return false;

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = [...match.teams.flatMap((team) => [team.code, team.name]), match.series, match.venue]
    .join(' ')
    .toLowerCase();

  return terms.every((term) => haystack.includes(term));
}
