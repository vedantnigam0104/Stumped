import { Check } from 'lucide-react';
import type { Match } from '@/types/cricket';
import { winnerOf } from '@/lib/cricketStats';
import Chip from '@/components/ui/Chip';
import TeamPill from '@/components/ui/TeamPill';

export default function CompletedMatchCard({ match }: { match: Match }) {
  const winner = winnerOf(match);

  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-surface/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50">
      <header className="flex items-center justify-between gap-3">
        <p className="truncate text-xs text-muted">
          {match.series}
          {match.venue && ` · ${match.venue}`}
        </p>
        <Chip>{match.format}</Chip>
      </header>

      <div className="flex flex-col gap-2">
        {match.innings.map((innings, index) => {
          const won = winner?.code === innings.code;
          const name = match.teams.find((team) => team.code === innings.code)?.name ?? innings.code;
          return (
            <div
              key={`${innings.code}-${index}`}
              className={`flex items-center justify-between gap-3 rounded-btn px-3 py-2 ${won ? 'bg-elevated' : ''}`}
            >
              <div className="flex items-center gap-3">
                <TeamPill code={innings.code} />
                <span className={`text-sm ${won ? 'font-medium text-ink' : 'text-muted'}`}>{name}</span>
                {won && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-on-accent" aria-label="Winner">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className={`font-display text-3xl leading-none tracking-wide ${won ? 'text-ink' : 'text-muted'}`}>
                {innings.runs}/{innings.wkts}
                <span className="ml-1.5 font-sans text-xs">({innings.overs})</span>
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-sm font-medium text-accent-text">{match.status}</p>
    </article>
  );
}
