const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cricket-data`;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type CricketConnection = { configured: boolean; hint: string | null };

function readErrorMessage(body: unknown): string | null {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') return body.error;
  return null;
}

async function send<T>(url: URL, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey, ...init.headers },
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) throw new Error(readErrorMessage(body) ?? `Request failed (${response.status})`);
  if (body === null || typeof body !== 'object') throw new Error('Received an unexpected response.');
  return body as T;
}

export function fetchCricket<T>(resource: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const url = new URL(baseUrl);
  url.searchParams.set('resource', resource);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return send<T>(url, { signal });
}

export function fetchCricketConnection(signal?: AbortSignal): Promise<CricketConnection> {
  return fetchCricket<CricketConnection>('settings', {}, signal);
}

export function saveCricketApiKey(apiKey: string): Promise<CricketConnection> {
  const url = new URL(baseUrl);
  url.searchParams.set('resource', 'settings');
  return send<CricketConnection>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });
}
