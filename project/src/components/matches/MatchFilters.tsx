import { Search } from 'lucide-react';
import SegmentedControl from '@/components/ui/SegmentedControl';
import type { FormatFilter } from '@/lib/matchFilters';

const formatOptions: { value: FormatFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'T20', label: 'T20' },
  { value: 'ODI', label: 'ODI' },
  { value: 'Test', label: 'Test' },
];

type MatchFiltersProps = {
  query: string;
  onQueryChange: (query: string) => void;
  format: FormatFilter;
  onFormatChange: (format: FormatFilter) => void;
};

export default function MatchFilters({ query, onQueryChange, format, onFormatChange }: MatchFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <label className="relative block md:w-72">
        <span className="sr-only">Search matches</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search team, series or venue"
          className="w-full rounded-btn border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted transition-colors duration-200 hover:border-accent/50 focus:border-accent focus:outline-none"
        />
      </label>
      <SegmentedControl label="Filter by format" options={formatOptions} value={format} onChange={onFormatChange} />
    </div>
  );
}
