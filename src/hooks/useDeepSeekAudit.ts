import { useState, useCallback } from 'react';
import type { AuditMetrics } from '@/lib/types';

export function useDeepSeekAudit() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(
    async (
      metrics: AuditMetrics,
    ): Promise<{ success: true } | { success: false; error: string }> => {
      setLoading(true);
      setError(null);
      setSummary(null);
      try {
        const res = await fetch('/api/ai/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics),
        });
        const data = await res.json();
        if (!res.ok) {
          const message = data.error ?? 'Audit request failed';
          setError(message);
          return { success: false, error: message };
        }
        setSummary(data.summary);
        return { success: true };
      } catch {
        const message =
          'Could not reach the audit service. Is the API server running?';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setSummary(null);
    setError(null);
  }, []);

  return { runAudit, loading, summary, error, reset };
}
