import { useMatches } from '@/lib/cricketQueries';
import { seriesGroupsFrom } from '@/lib/cricketStats';
import type { RouteId } from '@/lib/routes';

export default function LeftRail({ onNavigate }: { onNavigate: (route: RouteId) => void }) {
  const matches = useMatches();
  const groups = matches.data ? seriesGroupsFrom(matches.data).slice(0, 6) : [];

  return (
    <nav aria-label="Series shortcuts" className="flex flex-col gap-1">
      <p className="px-3 pb-2 text-xs uppercase tracking-[0.18em] text-muted">Series</p>
      {matches.loading && <p className="px-3 py-2 text-sm text-muted">Loading...</p>}
      {groups.map((series) => (
        <button
          key={series.name}
          type="button"
          onClick={() => onNavigate('series')}
          className="group flex items-center gap-3 rounded-btn px-3 py-2 text-left text-sm text-muted transition-colors duration-200 hover:bg-elevated hover:text-ink"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-btn border border-line bg-surface font-display text-xs tracking-wider transition-colors duration-200 group-hover:border-accent group-hover:text-accent-text">
            {series.format}
          </span>
          <span className="truncate">{series.name}</span>
          {series.live > 0 && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Live" />}
        </button>
      ))}
    </nav>
  );
}
