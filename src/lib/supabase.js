import { createClient } from "@supabase/supabase-js";

const url = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const key = String(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "",
).trim();

export const isSupabaseConfigured = Boolean(url && key);
export const SUPABASE_REPORTS_TABLE = "wpcc_reports";

// This application intentionally has no login. The browser uses only a publishable/anon key;
// never put a Supabase service-role key in VITE_* variables or ship it to the browser.
export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

export const supabaseProjectUrl = url;
