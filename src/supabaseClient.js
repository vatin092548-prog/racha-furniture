import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cunbztyzryjdddltwgku.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aQtIbAF7V4Zl1HMa2qredQ_rKfSkyMi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);