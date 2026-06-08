import { useState, useCallback } from 'react';

interface UseAIOptions {
  endpoint: string;
}

export function useAI<TPayload extends object, TResponse = { summary?: string; error?: string }>(
  { endpoint }: UseAIOptions,
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      payload: TPayload,
    ): Promise<{ success: true; data: TResponse } | { success: false; error: string }> => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = (await res.json()) as TResponse & { error?: string };
        if (!res.ok) {
          const message = body.error ?? 'AI request failed';
          setError(message);
          return { success: false, error: message };
        }
        setData(body);
        return { success: true, data: body };
      } catch {
        const message = 'Could not reach the AI service. Is the API server running?';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [endpoint],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { run, loading, data, error, reset };
}
