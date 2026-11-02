import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { RouteId } from '@/lib/routes';
import TopBar from '@/components/shell/TopBar';
import LeftRail from '@/components/shell/LeftRail';
import MobileTabBar from '@/components/shell/MobileTabBar';
import TrendingPlayers from '@/components/rails/TrendingPlayers';
import SeriesStandings from '@/components/rails/SeriesStandings';
import MatchesPage from '@/pages/MatchesPage';
import NewsPage from '@/pages/NewsPage';
import SeriesPage from '@/pages/SeriesPage';
import ProfilePage from '@/pages/ProfilePage';
import PlayerPage from '@/pages/PlayerPage';

type PageProps = {
  route: RouteId;
  selectedPlayerId: string | null;
  onNavigate: (route: RouteId) => void;
  onSelectPlayer: (id: string) => void;
};

function renderPage({ route, selectedPlayerId, onNavigate, onSelectPlayer }: PageProps) {
  switch (route) {
    case 'live':
    case 'schedule':
      return <MatchesPage />;
    case 'news':
      return <NewsPage />;
    case 'series':
      return <SeriesPage />;
    case 'profile':
      return <ProfilePage onSelectPlayer={onSelectPlayer} />;
    case 'player':
      return <PlayerPage playerId={selectedPlayerId ?? ''} onBack={() => onNavigate('live')} />;
  }
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [route, setRoute] = useState<RouteId>('live');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const selectPlayer = (id: string) => {
    setSelectedPlayerId(id);
    setRoute('player');
  };

  useEffect(() => {
    if (route === 'schedule') {
      document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.scrollTo({ top: 0 });
  }, [route]);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <TopBar
        route={route}
        onNavigate={setRoute}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectPlayer={selectPlayer}
      />

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-8 px-4 pb-28 pt-6 md:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-16 lg:pt-8">
        <aside className="hidden lg:col-span-2 lg:block">
          <div className="lg:sticky lg:top-24">
            <LeftRail onNavigate={setRoute} />
          </div>
        </aside>

        <main className="min-w-0 lg:col-span-7">
          {renderPage({ route, selectedPlayerId, onNavigate: setRoute, onSelectPlayer: selectPlayer })}
        </main>

        <aside className="min-w-0 lg:col-span-3">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <TrendingPlayers onSelectPlayer={selectPlayer} />
            <SeriesStandings />
          </div>
        </aside>
      </div>

      <MobileTabBar route={route} onNavigate={setRoute} />

    </div>
  );
}
