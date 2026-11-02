import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import type { Match, InningsScore } from '@/types/cricket';
import { requiredRate, runRate, teamName } from '@/lib/cricketStats';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import LiveBadge from '@/components/ui/LiveBadge';
import TeamPill from '@/components/ui/TeamPill';
import ScorecardModal from '@/components/matches/ScorecardModal';

function InningsRow({ match, innings, batting }: { match: Match; innings: InningsScore; batting: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <TeamPill code={innings.code} />
        <div>
          <p className="text-sm font-medium">{teamName(match, innings.code)}</p>
          {batting && <p className="text-xs font-medium text-accent-text">Batting</p>}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          key={`${innings.runs}-${innings.wkts}`}
          className="animate-score-in font-display text-6xl leading-none tracking-wide md:text-7xl motion-reduce:animate-none"
        >
          {innings.runs}/{innings.wkts}
        </span>
        <span className="text-sm text-muted">({innings.overs})</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-btn bg-elevated px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

export default function LiveMatchCard({ match }: { match: Match }) {
  const [scorecardOpen, setScorecardOpen] = useState(false);

  const innings = match.innings;
  const current = innings[innings.length - 1];
  const target = innings.length >= 2 ? innings[0].runs + 1 : null;

  const stats: { label: string; value: string }[] = [];
  if (current) stats.push({ label: 'CRR', value: runRate(current.runs, current.overs).toFixed(2) });
  if (current && target !== null) {
    const rate = requiredRate(match.format, target, current.runs, current.overs);
    stats.push({ label: 'RRR', value: rate === null ? '-' : rate.toFixed(2) });
    stats.push({ label: 'Target', value: String(target) });
  }

  return (
    <>
      <article className="rounded-card border border-line bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <LiveBadge />
            <p className="text-sm text-muted">
              {match.series}
              {match.venue && ` · ${match.venue}`}
            </p>
          </div>
          <Chip>{match.format}</Chip>
        </header>

        <div className="mt-6 flex flex-col gap-5">
          {innings.map((item, index) => (
            <InningsRow key={`${item.code}-${index}`} match={match} innings={item} batting={index === innings.length - 1} />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-5 border-t border-line pt-6">
          <p className="text-base font-medium">{match.status}</p>

          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <Stat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => setScorecardOpen(true)}>
              <ClipboardList size={16} />
              Scorecard
            </Button>
          </div>
        </div>
      </article>

      <ScorecardModal match={match} open={scorecardOpen} onClose={() => setScorecardOpen(false)} />
    </>
  );
}
