/*
# Create cricket_cache table

1. New Tables
- `cricket_cache`
  - `cache_key` (text, primary key): identifies one cached cricket API response, for example "matches" or "scorecard:<id>".
  - `payload` (jsonb): the normalized response stored for that key.
  - `fetched_at` (timestamptz): when the response was last fetched from the provider.

2. Security
- Enable RLS on `cricket_cache`. No policies are added, so browsers using the public key cannot read or write it.
- Grant SELECT, INSERT, UPDATE to `service_role` only, used by the cricket data function to keep the provider's daily request quota under control.

3. Notes
- The cache is what lets many visitors share one provider request instead of each triggering their own.
*/

CREATE TABLE IF NOT EXISTS cricket_cache (
  cache_key text PRIMARY KEY,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cricket_cache ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON cricket_cache TO service_role;
