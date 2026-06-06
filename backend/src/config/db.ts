import { createClient } from '@supabase/supabase-js';
import { config } from './config';

if (!config.supabase.url || !config.supabase.key) {
  throw new Error('Missing Supabase URL or Key');
}

export const supabase = createClient(config.supabase.url, config.supabase.key);
