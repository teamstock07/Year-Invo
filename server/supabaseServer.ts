import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://rsacszkrsvktlzktdimp.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_AQxVMWq7721kCZphG6f08w_tfK8BTon';

export const serverSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
