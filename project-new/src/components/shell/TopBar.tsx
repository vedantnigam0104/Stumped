import { Moon, Sun, Zap } from 'lucide-react';
import { navLinks } from '@/lib/routes';
import type { RouteId } from '@/lib/routes';
import type { Theme } from '@/hooks/useTheme';
import IconButton from '@/components/ui/IconButton';
import SearchPanel from '@/components/shell/SearchPanel';

type TopBarProps = {
  route: RouteId;
  onNavigate: (route: RouteId) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onSelectPlayer: (id: string) => void;
};

export default function TopBar({
  route,
  onNavigate,
  theme,
  onToggleTheme,
  onSelectPlayer,
}: TopBarProps) {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-4 px-4 md:px-6 lg:h-16 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('live')}
          aria-label="Stumped home"
          className="flex items-center gap-2.5 rounded-btn transition-opacity hover:opacity-80"
        >
          <span className="grid h-8 w-8 place-items-center rounded-btn bg-accent text-on-accent">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-2xl leading-none tracking-[0.14em]">STUMPED</span>
        </button>

        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = link.id === route;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative h-16 text-sm transition-colors duration-200 hover:text-ink ${active ? 'text-ink' : 'text-muted'}`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <SearchPanel onSelectPlayer={onSelectPlayer} />
          <IconButton label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={onToggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            aria-label="Open profile"
            className={`grid h-8 w-8 place-items-center rounded-full bg-elevated text-xs font-semibold text-accent-text ring-1 transition-colors hover:ring-accent ${route === 'profile' ? 'ring-accent' : 'ring-line'}`}
          >
            SF
          </button>
        </div>
      </div>
    </header>
  );
}
