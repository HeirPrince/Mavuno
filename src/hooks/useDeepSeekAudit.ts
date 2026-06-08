import { useCallback } from 'react';
import type { AuditMetrics } from '@/lib/types';
import { useAI } from '@/hooks/useAI';

export function useDeepSeekAudit() {
  const { run, loading, data, error, reset } = useAI<
    AuditMetrics,
    { summary: string }
  >({ endpoint: '/api/ai/audit' });

  const runAudit = useCallback(
    async (
      metrics: AuditMetrics,
    ): Promise<{ success: true } | { success: false; error: string }> => {
      const result = await run(metrics);
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [run],
  );

  return {
    runAudit,
    loading,
    summary: data?.summary ?? null,
    error,
    reset,
  };
}
