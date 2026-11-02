import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { fetchCricketConnection, saveCricketApiKey } from '@/lib/cricketApi';
import type { CricketConnection } from '@/lib/cricketApi';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

type CricketSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function CricketSettingsModal({ open, onClose, onSaved }: CricketSettingsModalProps) {
  const [connection, setConnection] = useState<CricketConnection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoadError(null);
    fetchCricketConnection(controller.signal)
      .then(setConnection)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : 'Could not read the connection status.');
      });
    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    if (open) return;
    setApiKey('');
    setSaveError(null);
    setSaved(false);
  }, [open]);

  const trimmed = apiKey.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmed || saving) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const next = await saveCricketApiKey(trimmed);
      setConnection(next);
      setApiKey('');
      setSaved(true);
      onSaved();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save the key. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Cricket data settings" onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-3 rounded-btn border border-line bg-elevated p-4">
          <KeyRound size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Connection status</p>
            {loadError && <p className="mt-1 text-sm text-muted">Could not read the status: {loadError}</p>}
            {!loadError && !connection && <p className="mt-1 text-sm text-muted">Checking...</p>}
            {connection?.configured && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-accent-text">
                <CheckCircle2 size={14} aria-hidden="true" />
                Connected, key ending in {connection.hint}
              </p>
            )}
            {connection && !connection.configured && (
              <p className="mt-1 text-sm text-muted">Not connected. Live matches and stats load once a key is saved.</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="cricket-api-key" className="text-sm font-medium">
              {connection?.configured ? 'Replace API key' : 'API key'}
            </label>
            <input
              id="cricket-api-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Paste your key from cricketdata.org"
              className="w-full rounded-btn border border-line bg-elevated px-3 py-2.5 font-mono text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-muted">
              The key is stored on the server and is never shown again in full.
            </p>
          </div>

          {saveError && (
            <p role="alert" className="rounded-btn border border-line bg-elevated px-3 py-2 text-sm text-ink">
              {saveError}
            </p>
          )}
          {saved && !saveError && <p className="text-sm text-accent-text">Key saved. Refreshing your cricket data.</p>}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={!trimmed || saving}>
              {saving ? 'Saving...' : 'Save key'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
