type TeamPillProps = { code: string };

export default function TeamPill({ code }: TeamPillProps) {
  return (
    <span className="inline-flex min-w-[3.25rem] items-center justify-center rounded-full border border-line bg-elevated px-3 py-1 font-display text-lg leading-none tracking-wider text-ink">
      {code}
    </span>
  );
}
