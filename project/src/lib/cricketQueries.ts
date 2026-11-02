import { useCricketResource } from '@/hooks/useCricketResource';
import type { Match, NewsItem, PlayerProfile, Scorecard } from '@/types/cricket';

export const useMatches = () => useCricketResource<Match[]>('matches', {});

export const useNews = () => useCricketResource<NewsItem[]>('news', {});

export const useScorecard = (matchId: string | null) =>
  useCricketResource<Scorecard>('scorecard', matchId ? { id: matchId } : null);

export const usePlayerProfile = (playerId: string | null) =>
  useCricketResource<PlayerProfile>('player', playerId ? { id: playerId } : null);
