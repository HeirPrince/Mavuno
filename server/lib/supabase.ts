const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() ?? process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey);
}

interface ProfileUpsert {
  clerk_user_id: string;
  role?: string;
  full_name?: string;
  phone?: string;
  district?: string;
  sector?: string;
  onboarding_complete?: boolean;
}

export async function upsertProfile(row: ProfileUpsert): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=clerk_user_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey!,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[supabase] profile upsert failed:', res.status, text);
  }
}
