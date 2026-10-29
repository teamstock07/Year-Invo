import { createClient } from '@supabase/supabase-js';

const metaEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || {};

export const SUPABASE_URL =
  metaEnv.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL : '') ||
  'https://rsacszkrsvktlzktdimp.supabase.co';

export const SUPABASE_ANON_KEY =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY : '') ||
  'sb_publishable_AQxVMWq7721kCZphG6f08w_tfK8BTon';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
