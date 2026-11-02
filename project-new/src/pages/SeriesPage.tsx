import { useMatches } from '@/lib/cricketQueries';
import { seriesGroupsFrom } from '@/lib/cricketStats';
import type { SeriesGroup } from '@/types/cricket';
import Chip from '@/components/ui/Chip';
import LiveBadge from '@/components/ui/LiveBadge';
import ResourceNotice from '@/components/ui/ResourceNotice';
import SectionHeader from '@/components/ui/SectionHeader';

function SeriesCard({ series }: { series: SeriesGroup }) {
  return (
    <article className="flex flex-col gap-5 rounded-card border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50">
      <div className="flex items-start justify-between gap-3">
        <span className="font-display text-2xl leading-none tracking-wider text-accent-text">{series.format}</span>
        <Chip>{series.total} {series.total === 1 ? 'match' : 'matches'}</Chip>
      </div>
      <h3 className="text-lg font-semibold leading-[1.2]">{series.name}</h3>
      <div className="mt-auto">
        {series.live > 0 ? <LiveBadge /> : <span className="text-xs font-medium text-muted">No live matches</span>}
      </div>
    </article>
  );
}

export default function SeriesPage() {
  const matches = useMatches();

  if (matches.loading) return <ResourceNotice tone="loading" title="Loading series" />;
  if (matches.error) {
    return <ResourceNotice tone="error" title="Series are unavailable" detail={matches.error} onRetry={matches.retry} />;
  }
  if (!matches.data) return null;

  const groups = seriesGroupsFrom(matches.data);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Series" />
      {groups.length === 0 ? (
        <ResourceNotice tone="empty" title="No series are listed right now" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((series) => (
            <SeriesCard key={series.name} series={series} />
          ))}
        </div>
      )}
    </div>
  );
}
