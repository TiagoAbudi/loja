import { createClient } from '@supabase/supabase-js'
import { Database } from './lib/database.types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL ou Anon Key não foram encontradas. Verifique seu arquivo .env.local");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)