import { User } from 'lucide-react';
import { useCricketFeed } from '@/hooks/useCricketFeed';
import { initialsOf } from '@/lib/initials';
import SectionHeader from '@/components/ui/SectionHeader';
import ResourceNotice from '@/components/ui/ResourceNotice';

type ProfilePageProps = {
  onSelectPlayer: (id: string) => void;
};

export default function ProfilePage({ onSelectPlayer }: ProfilePageProps) {
  const { players, scorecard } = useCricketFeed();

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Your profile" />
      <section className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface p-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-elevated text-accent-text ring-1 ring-line">
          <User size={28} />
        </span>
        <div>
          <h3 className="text-lg font-semibold">Fan profile coming soon</h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Sign-in, followed teams, and saved reminders will live here once accounts are enabled.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold leading-[1.2]">Players in focus</h3>
        {scorecard.loading && <ResourceNotice tone="loading" title="Loading players" />}
        {scorecard.error && (
          <ResourceNotice tone="error" title="Players are unavailable" detail={scorecard.error} onRetry={scorecard.retry} />
        )}
        {!scorecard.loading && !scorecard.error && players.length === 0 && (
          <ResourceNotice tone="empty" title="No players to show yet" />
        )}
        {players.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {players.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => onSelectPlayer(player.id)}
                  className="flex w-full items-center gap-3 rounded-card border border-line bg-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-elevated text-sm font-semibold ring-1 ring-line">
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
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
