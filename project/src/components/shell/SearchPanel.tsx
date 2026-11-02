import { useState } from 'react';
import { Search, X } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import { useCricketFeed } from '@/hooks/useCricketFeed';
import { seriesGroupsFrom, uniqueTeams } from '@/lib/cricketStats';

type SearchPanelProps = {
  onSelectPlayer: (id: string) => void;
};

export default function SearchPanel({ onSelectPlayer }: SearchPanelProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { matches, players } = useCricketFeed();
  const allMatches = matches.data ?? [];

  const term = query.trim().toLowerCase();
  const teams = term
    ? uniqueTeams(allMatches).filter((team) => `${team.code} ${team.name}`.toLowerCase().includes(term))
    : [];
  const matchedPlayers = term ? players.filter((player) => player.name.toLowerCase().includes(term)) : [];
  const series = term ? seriesGroupsFrom(allMatches).filter((group) => group.name.toLowerCase().includes(term)) : [];
  const hasResults = teams.length + matchedPlayers.length + series.length > 0;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <IconButton label={open ? 'Close search' : 'Open search'} onClick={() => (open ? close() : setOpen(true))}>
        {open ? <X size={18} /> : <Search size={18} />}
      </IconButton>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] rounded-card border border-line bg-surface p-3">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') close();
            }}
            placeholder="Search teams, players, series"
            aria-label="Search teams, players, series"
            className="w-full rounded-btn border border-line bg-elevated px-3 py-2 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
          />

          {term && (
            <ul className="mt-3 flex max-h-72 flex-col gap-1 overflow-y-auto text-sm">
              {teams.map((team) => (
                <li key={team.code} className="flex items-center justify-between rounded-btn px-3 py-2">
                  <span>{team.name}</span>
                  <span className="text-xs text-muted">Team</span>
                </li>
              ))}
              {matchedPlayers.map((player) => (
                <li key={player.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPlayer(player.id);
                      close();
                    }}
                    className="flex w-full items-center justify-between rounded-btn px-3 py-2 text-left transition-colors duration-200 hover:bg-elevated"
                  >
                    <span>{player.name}</span>
                    <span className="text-xs text-muted">Player</span>
                  </button>
                </li>
              ))}
              {series.map((group) => (
                <li key={group.name} className="flex items-center justify-between rounded-btn px-3 py-2">
                  <span>{group.name}</span>
                  <span className="text-xs text-muted">Series</span>
                </li>
              ))}
              {!hasResults && <li className="px-3 py-2 text-muted">No results for "{query.trim()}"</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
