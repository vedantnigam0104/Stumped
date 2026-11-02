/*
# Create cricket_settings table

1. New Tables
- `cricket_settings`
  - `id` (smallint, primary key): always 1, so the table holds one settings row.
  - `api_key` (text, not null): the cricket data provider key entered in the app's settings.
  - `updated_at` (timestamptz): when the key was last saved.

2. Security
- Enable RLS on `cricket_settings`. No policies are added, so browsers using the public key cannot read or write it.
- Grant SELECT, INSERT, UPDATE to `service_role` only, used by the cricket data function to read the saved key and store a new one.

3. Notes
- The key never leaves the server. The app only receives whether a key is set and its last four characters.
*/

CREATE TABLE IF NOT EXISTS cricket_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  api_key text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cricket_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON cricket_settings TO service_role;
