import { CalendarDays, Newspaper, Radio, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RouteId = 'live' | 'schedule' | 'news' | 'series' | 'profile' | 'player';

export const navLinks: { id: RouteId; label: string }[] = [
  { id: 'live', label: 'Live' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'news', label: 'News' },
  { id: 'series', label: 'Series' },
];

export const mobileTabs: { id: RouteId; label: string; icon: LucideIcon }[] = [
  { id: 'live', label: 'Matches', icon: Radio },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'series', label: 'Series', icon: CalendarDays },
  { id: 'profile', label: 'Profile', icon: User },
];
