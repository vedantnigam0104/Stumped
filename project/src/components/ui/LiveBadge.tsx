export default function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold tracking-wider text-accent-text">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      LIVE
    </span>
  );
}
