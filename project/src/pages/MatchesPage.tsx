import { useState } from 'react';
import type { Match } from '@/types/cricket';
import { splitMatches } from '@/lib/cricketStats';
import { passesFilters, type FormatFilter } from '@/lib/matchFilters';
import { useMatches } from '@/lib/cricketQueries';
import LiveMatchCard from '@/components/matches/LiveMatchCard';
import UpcomingMatchCard from '@/components/matches/UpcomingMatchCard';
import CompletedMatchCard from '@/components/matches/CompletedMatchCard';
import MatchFilters from '@/components/matches/MatchFilters';
import Button from '@/components/ui/Button';
import ResourceNotice from '@/components/ui/ResourceNotice';
import SectionHeader from '@/components/ui/SectionHeader';

function MatchSections({ matches }: { matches: Match[] }) {
  const [reminders, setReminders] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState<FormatFilter>('All');

  const toggleReminder = (id: string) =>
    setReminders((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const sections = splitMatches(matches);
  const visibleLive = sections.live.filter((match) => passesFilters(match, query, format));
  const visibleUpcoming = sections.upcoming.filter((match) => passesFilters(match, query, format));
  const visibleCompleted = sections.completed.filter((match) => passesFilters(match, query, format));
  const visibleCount = visibleLive.length + visibleUpcoming.length + visibleCompleted.length;
  const filtersActive = query.trim() !== '' || format !== 'All';

  const clearFilters = () => {
    setQuery('');
    setFormat('All');
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <SectionHeader title="Matches">
          <p className="text-sm text-muted">
            Showing {visibleCount} of {matches.length}
          </p>
        </SectionHeader>
        <MatchFilters query={query} onQueryChange={setQuery} format={format} onFormatChange={setFormat} />
        {filtersActive && (
          <div>
            <Button variant="ghost" className="px-0" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </section>

      {visibleCount === 0 && (
        <ResourceNotice
          tone="empty"
          title={matches.length === 0 ? 'No matches are listed right now' : 'No matches fit these filters'}
          detail={matches.length === 0 ? 'Check back soon for live and upcoming fixtures.' : 'Try a different team, series or format.'}
        />
      )}

      {visibleLive.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Live now" />
          {visibleLive.map((match) => (
            <LiveMatchCard key={match.id} match={match} />
          ))}
        </section>
      )}

      {visibleUpcoming.length > 0 && (
        <section id="schedule" className="flex scroll-mt-24 flex-col gap-4">
          <SectionHeader title="Upcoming" />
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleUpcoming.map((match) => (
              <UpcomingMatchCard
                key={match.id}
                match={match}
                reminderSet={reminders.includes(match.id)}
                onToggleReminder={() => toggleReminder(match.id)}
              />
            ))}
          </div>
        </section>
      )}

      {visibleCompleted.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Results" />
          <div className="flex flex-col gap-4">
            {visibleCompleted.map((match) => (
              <CompletedMatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function MatchesPage() {
  const matches = useMatches();

  if (matches.loading) return <ResourceNotice tone="loading" title="Loading matches" />;
  if (matches.error) {
    return <ResourceNotice tone="error" title="Matches are unavailable" detail={matches.error} onRetry={matches.retry} />;
  }
  if (!matches.data) return null;

  return <MatchSections matches={matches.data} />;
}
