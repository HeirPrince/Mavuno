import { useSession } from '@clerk/react';
import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import type { Database } from '@/lib/database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseConfig';

export function useSupabaseClient() {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
        global: {
            fetch: async (url, options: RequestInit = {}) => {
              const token = await session?.getToken({ template: 'supabase' });
              const headers = new Headers(options.headers);
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return fetch(url, { ...options, headers });
          },
        },
      }),
    [session],
  );
}
