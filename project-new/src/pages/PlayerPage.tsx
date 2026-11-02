import { ArrowLeft } from 'lucide-react';
import { usePlayerProfile } from '@/lib/cricketQueries';
import { initialsOf } from '@/lib/initials';
import Button from '@/components/ui/Button';
import ResourceNotice from '@/components/ui/ResourceNotice';

type PlayerPageProps = {
  playerId: string;
  onBack: () => void;
};

const fmt = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : '-');

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export default function PlayerPage({ playerId, onBack }: PlayerPageProps) {
  const profile = usePlayerProfile(playerId);

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="self-start px-0" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to matches
      </Button>

      {profile.loading && <ResourceNotice tone="loading" title="Loading player" />}
      {profile.error && (
        <ResourceNotice tone="error" title="Player profile is unavailable" detail={profile.error} onRetry={profile.retry} />
      )}

      {profile.data && (
        <>
          <section className="flex flex-col gap-6 rounded-card border border-line bg-surface p-6 md:flex-row md:items-center md:p-8">
            {profile.data.image ? (
              <img
                src={profile.data.image}
                alt={profile.data.name}
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-line"
              />
            ) : (
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-elevated text-2xl font-semibold ring-1 ring-line">
                {initialsOf(profile.data.name)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-semibold leading-[1.2] tracking-tight">{profile.data.name}</h1>
              <p className="mt-1 text-sm text-muted">{[profile.data.role, profile.data.country].filter(Boolean).join(' · ')}</p>
            </div>
          </section>

          <section className="grid gap-6 rounded-card border border-line bg-surface p-6 sm:grid-cols-3">
            <Detail label="Batting" value={profile.data.battingStyle} />
            <Detail label="Bowling" value={profile.data.bowlingStyle} />
            <Detail label="Born" value={profile.data.dateOfBirth} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold leading-[1.2]">Career</h2>
            {profile.data.career.length === 0 ? (
              <ResourceNotice tone="empty" title="No career statistics are available for this player" />
            ) : (
              <div className="overflow-x-auto rounded-card border border-line bg-surface">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="border-b border-line bg-elevated/50 text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">Format</th>
                      <th className="px-5 py-3 text-right font-medium">Mat</th>
                      <th className="px-5 py-3 text-right font-medium">Runs</th>
                      <th className="px-5 py-3 text-right font-medium">Bat Avg</th>
                      <th className="px-5 py-3 text-right font-medium">Wkts</th>
                      <th className="px-5 py-3 text-right font-medium">Bowl Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.data.career.map((row) => (
                      <tr key={row.format} className="border-b border-line last:border-0 transition-colors hover:bg-elevated/60">
                        <td className="px-5 py-4 font-medium">{row.format}</td>
                        <td className="px-5 py-4 text-right text-muted">{row.matches}</td>
                        <td className="px-5 py-4 text-right font-semibold">{row.runs}</td>
                        <td className="px-5 py-4 text-right text-muted">{fmt(row.average)}</td>
                        <td className="px-5 py-4 text-right text-muted">{row.wickets}</td>
                        <td className="px-5 py-4 text-right text-muted">{fmt(row.bowlingAverage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
