import { Bell, BellRing } from 'lucide-react';
import type { Match } from '@/types/cricket';
import { formatMatchStart } from '@/lib/format';
import { useCountdown } from '@/hooks/useCountdown';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import TeamPill from '@/components/ui/TeamPill';

type UpcomingMatchCardProps = {
  match: Match;
  reminderSet: boolean;
  onToggleReminder: () => void;
};

export default function UpcomingMatchCard({ match, reminderSet, onToggleReminder }: UpcomingMatchCardProps) {
  const countdown = useCountdown(new Date(match.startsAt).getTime());
  const [home, away] = match.teams;

  return (
    <article className="flex flex-col gap-5 rounded-card border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50">
      <header className="flex items-center justify-between gap-3">
        <p className="truncate text-xs text-muted">
          {match.series}
          {match.venue && ` · ${match.venue}`}
        </p>
        <Chip>{match.format}</Chip>
      </header>

      <div className="flex items-center justify-between gap-3">
        <TeamPill code={home?.code ?? 'TBA'} />
        <span className="text-xs uppercase tracking-widest text-muted">vs</span>
        <TeamPill code={away?.code ?? 'TBA'} />
      </div>

      <p className="text-sm text-muted">{formatMatchStart(match.startsAt)}</p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="text-xs text-muted">Starts in</p>
          <p className="mt-1 font-semibold tabular-nums">{countdown}</p>
        </div>
        <Button variant={reminderSet ? 'primary' : 'outline'} aria-pressed={reminderSet} onClick={onToggleReminder}>
          {reminderSet ? <BellRing size={16} /> : <Bell size={16} />}
          {reminderSet ? 'Reminder set' : 'Set reminder'}
        </Button>
      </div>
    </article>
  );
}
