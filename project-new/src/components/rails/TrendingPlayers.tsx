import { TrendingUp } from 'lucide-react';
import { useCricketFeed } from '@/hooks/useCricketFeed';
import { initialsOf } from '@/lib/initials';
import type { FeedPlayer } from '@/types/cricket';

type PlayerRowProps = {
  player: FeedPlayer;
  onSelect: (id: string) => void;
};

function PlayerRow({ player, onSelect }: PlayerRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(player.id)}
        className="group flex w-full items-center gap-3 rounded-btn px-1 py-3 text-left transition-colors duration-200 hover:bg-elevated/60"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-elevated text-sm font-semibold ring-1 ring-line transition-colors duration-200 group-hover:ring-accent">
          {initialsOf(player.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{player.name}</p>
          <p className="truncate text-xs text-muted">
            {player.teamCode} · {player.line}
          </p>
        </div>
      </button>
    </li>
  );
}

export default function TrendingPlayers({ onSelectPlayer }: { onSelectPlayer: (id: string) => void }) {
  const { players, matches, scorecard } = useCricketFeed();
  const loading = matches.loading || scorecard.loading;
  const failed = matches.error || scorecard.error;

  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Players in focus</h2>
        <TrendingUp size={16} className="text-muted" aria-hidden="true" />
      </header>

      {loading && <p className="mt-4 text-sm text-muted">Loading players...</p>}
      {!loading && failed && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">Players unavailable</span>
          <button type="button" onClick={scorecard.retry} className="font-medium text-accent-text hover:underline">
            Retry
          </button>
        </div>
      )}
      {!loading && !failed && players.length === 0 && (
        <p className="mt-4 text-sm text-muted">Players appear once a match has a scorecard.</p>
      )}

      {players.length > 0 && (
        <ul className="mt-2 divide-y divide-line">
          {players.map((player) => (
            <PlayerRow key={player.id} player={player} onSelect={onSelectPlayer} />
          ))}
        </ul>
      )}
    </section>
  );
}
