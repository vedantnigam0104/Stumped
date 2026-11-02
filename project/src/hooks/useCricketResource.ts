import { useCallback, useEffect, useState } from 'react';
import { fetchCricket } from '@/lib/cricketApi';

type Params = Record<string, string>;

type ResourceState<T> = { data: T | null; error: string | null; loading: boolean };

export function useCricketResource<T>(resource: string, params: Params | null) {
  const key = params ? JSON.stringify(params) : null;
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, loading: key !== null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (key === null) {
      setState({ data: null, error: null, loading: false });
      return;
    }

    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));

    fetchCricket<T>(resource, JSON.parse(key) as Params, controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        setState({ data: null, error: message, loading: false });
      });

    return () => controller.abort();
  }, [resource, key, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { ...state, retry };
}
