import { useMemo } from 'react';
import { useMatches, useScorecard } from '@/lib/cricketQueries';
import { featuredMatch, scorecardPlayers } from '@/lib/cricketStats';
import type { FeedPlayer } from '@/types/cricket';

export function useCricketFeed() {
  const matches = useMatches();
  const featured = matches.data ? featuredMatch(matches.data) : null;
  const scorecard = useScorecard(featured?.id ?? null);

  const players = useMemo<FeedPlayer[]>(
    () => (scorecard.data ? scorecardPlayers(scorecard.data) : []),
    [scorecard.data],
  );

  return { matches, scorecard, players };
}
