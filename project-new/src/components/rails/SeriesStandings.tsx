import { useMatches } from '@/lib/cricketQueries';
import { standingsFrom } from '@/lib/cricketStats';
import TeamPill from '@/components/ui/TeamPill';

export default function SeriesStandings() {
  const matches = useMatches();
  const rows = matches.data ? standingsFrom(matches.data) : [];

  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <header className="flex items-end justify-between">
        <h2 className="text-base font-semibold">Standings</h2>
        <p className="text-xs text-muted">From recent results</p>
      </header>

      {matches.loading && <p className="mt-4 text-sm text-muted">Loading standings...</p>}
      {matches.error && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">Standings unavailable</span>
          <button type="button" onClick={matches.retry} className="font-medium text-accent-text hover:underline">
            Retry
          </button>
        </div>
      )}
      {!matches.loading && !matches.error && rows.length === 0 && (
        <p className="mt-4 text-sm text-muted">No completed results yet.</p>
      )}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                <th className="pb-2 text-left font-medium">#</th>
                <th className="pb-2 text-left font-medium">Team</th>
                <th className="pb-2 text-right font-medium">P</th>
                <th className="pb-2 text-right font-medium">W</th>
                <th className="pb-2 text-right font-medium">L</th>
                <th className="pb-2 text-right font-medium">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, index) => (
                <tr key={row.code} className="transition-colors hover:bg-elevated/60">
                  <td className="py-2.5 text-muted">{index + 1}</td>
                  <td className="py-2.5" title={row.name}>
                    <TeamPill code={row.code} />
                  </td>
                  <td className="py-2.5 text-right text-muted">{row.played}</td>
                  <td className="py-2.5 text-right text-muted">{row.won}</td>
                  <td className="py-2.5 text-right text-muted">{row.lost}</td>
                  <td className={`py-2.5 text-right font-semibold ${index === 0 ? 'text-accent-text' : ''}`}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
