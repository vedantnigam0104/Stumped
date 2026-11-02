import type { ReactNode } from 'react';

export default function SectionHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold leading-[1.2] tracking-tight">{title}</h2>
      {children}
    </header>
  );
}
