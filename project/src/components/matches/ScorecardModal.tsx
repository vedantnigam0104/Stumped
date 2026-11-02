import { useState } from 'react';
import type { Batter, Bowler, Match, Scorecard, ScorecardInnings } from '@/types/cricket';
import { useScorecard } from '@/lib/cricketQueries';
import Modal from '@/components/ui/Modal';
import SegmentedControl from '@/components/ui/SegmentedControl';
import ResourceNotice from '@/components/ui/ResourceNotice';

function InningsTables({ innings, teamLabel }: { innings: ScorecardInnings; teamLabel: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-semibold">{teamLabel}</p>
        <p className="font-display text-3xl leading-none tracking-wide">
          {innings.runs}/{innings.wkts} <span className="font-sans text-sm text-muted">({innings.overs} ov)</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] text-sm">
          <caption className="mb-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted">Batting</caption>
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <th className="pb-2 text-left font-medium">Batter</th>
              <th className="pb-2 text-right font-medium">R</th>
              <th className="pb-2 text-right font-medium">B</th>
              <th className="pb-2 text-right font-medium">4s</th>
              <th className="pb-2 text-right font-medium">6s</th>
              <th className="pb-2 text-right font-medium">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {innings.batters.map((batter: Batter, index) => (
              <tr key={`${batter.name}-${index}`} className="transition-colors hover:bg-elevated/60">
                <td className="py-3">
                  <p className="font-medium">{batter.name}</p>
                  <p className="text-xs text-muted">{batter.dismissal}</p>
                </td>
                <td className="py-3 text-right font-semibold">{batter.runs}</td>
                <td className="py-3 text-right text-muted">{batter.balls}</td>
                <td className="py-3 text-right text-muted">{batter.fours}</td>
                <td className="py-3 text-right text-muted">{batter.sixes}</td>
                <td className="py-3 text-right text-muted">{batter.strikeRate.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] text-sm">
          <caption className="mb-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted">Bowling</caption>
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <th className="pb-2 text-left font-medium">Bowler</th>
              <th className="pb-2 text-right font-medium">O</th>
              <th className="pb-2 text-right font-medium">M</th>
              <th className="pb-2 text-right font-medium">R</th>
              <th className="pb-2 text-right font-medium">W</th>
              <th className="pb-2 text-right font-medium">Econ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {innings.bowlers.map((bowler: Bowler, index) => (
              <tr key={`${bowler.name}-${index}`} className="transition-colors hover:bg-elevated/60">
                <td className="py-3 font-medium">{bowler.name}</td>
                <td className="py-3 text-right text-muted">{bowler.overs}</td>
                <td className="py-3 text-right text-muted">{bowler.maidens}</td>
                <td className="py-3 text-right text-muted">{bowler.runs}</td>
                <td className="py-3 text-right font-semibold">{bowler.wickets}</td>
                <td className="py-3 text-right text-muted">{bowler.economy.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScorecardBody({ scorecard }: { scorecard: Scorecard }) {
  const [selected, setSelected] = useState(0);
  const innings = scorecard.innings[selected] ?? scorecard.innings[0];

  if (!innings) return <ResourceNotice tone="empty" title="The scorecard has not started yet" />;

  const label = scorecard.teams.find((team) => team.code === innings.code)?.name ?? innings.code;

  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl
        label="Innings"
        value={String(selected)}
        onChange={(value) => setSelected(Number(value))}
        options={scorecard.innings.map((item, index) => ({
          value: String(index),
          label: `${item.code} ${item.runs}/${item.wkts}`,
        }))}
      />
      <InningsTables innings={innings} teamLabel={label} />
    </div>
  );
}

type ScorecardModalProps = {
  match: Match;
  open: boolean;
  onClose: () => void;
};

export default function ScorecardModal({ match, open, onClose }: ScorecardModalProps) {
  const scorecard = useScorecard(open ? match.id : null);

  return (
    <Modal open={open} title={`Scorecard · ${match.series}`} onClose={onClose}>
      {scorecard.loading && <ResourceNotice tone="loading" title="Loading scorecard" />}
      {scorecard.error && (
        <ResourceNotice tone="error" title="Scorecard unavailable" detail={scorecard.error} onRetry={scorecard.retry} />
      )}
      {scorecard.data && <ScorecardBody scorecard={scorecard.data} />}
    </Modal>
  );
}
