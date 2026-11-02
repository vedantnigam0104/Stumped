import type { ReactNode } from 'react';

export default function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-violet/40 bg-violet/15 px-2.5 py-0.5 text-xs font-medium text-violet">
      {children}
    </span>
  );
}
