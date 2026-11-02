import { mobileTabs } from '@/lib/routes';
import type { RouteId } from '@/lib/routes';

export default function MobileTabBar({ route, onNavigate }: { route: RouteId; onNavigate: (route: RouteId) => void }) {
  return (
    <nav aria-label="Primary mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {mobileTabs.map((tab) => {
          const active = tab.id === 'live' ? route === 'live' || route === 'schedule' : route === tab.id;
          const Icon = tab.icon;
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onNavigate(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex w-full flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors duration-200 ${active ? 'text-accent-text' : 'text-muted hover:text-ink'}`}
              >
                <span
                  className={`absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0'}`}
                />
                <Icon size={20} strokeWidth={active ? 2.25 : 2} />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
