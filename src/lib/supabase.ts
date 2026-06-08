import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from './supabaseConfig';

export const supabase = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
