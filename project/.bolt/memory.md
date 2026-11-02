# Project memory

## Product intent & audience

- Full-stack UI for live cricket scores, news, and player statistics.
- Audience: cricket fans wanting real-time match updates, news, and player profiles.
- Must show real data, not dummy content; all pages should reflect live API responses.

## Brand personality & voice

- Editorial, dark-mode-first presentation.
- Focused on authenticity and real-time information over decorative content.

## Visual design & UX direction

- Dark-mode-first editorial design; responsive across screen sizes.
- Lucide React icons used throughout (no other icon packages).
- Tailwind CSS for styling; JSX + React hooks.
- Import via `@/` path alias (maps to `src/`).
- Pages display loading or "unavailable" states when API data is missing.

## Decisions, constraints & rationale

- Data source: CricAPI via cricketdata.org (free tier, ~100 calls/day).
  - Covers: current/live matches, scorecards, player profiles, series, standings.
  - Does NOT cover: ICC rankings, ball-by-ball commentary, video highlights.
- BBC cricket RSS feed used as real news source.
- API key required as `CRICKET_API_KEY` secret; not yet provided by user — app cannot show real data until set.
- Edge function deployed to call CricAPI + BBC feed with caching and normalized output.
- Supabase cache table created to reduce API call usage.
- Rankings page removed entirely (including nav entries) — no free-tier data source.
- Ball-by-ball commentary removed — not available on free tier.
- Highlights/video section removed — no verified free, keyless video source.
- News date parsing made safe against malformed dates.
- Dummy data module deleted; all references removed; type check and build pass.

## Open questions & assumptions

- User must supply a free CricAPI key from cricketdata.org; without it, all data pages show loading/unavailable.
- Field mismatches between expected and actual API responses may surface once live testing begins; will need fixing after key is provided.
- Caching strategy assumes ~100 calls/day free tier is sufficient for expected usage patterns.