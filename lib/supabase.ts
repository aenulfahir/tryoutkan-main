import { createClient } from "@supabase/supabase-js";

// Try to get from environment variables first
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to hardcoded values for production deployment
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Environment variables not found, using fallback values");
  supabaseUrl = "https://vhgwcljzzsudyzzicmcc.supabase.co";
  supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3djbGp6enN1ZHl6emljbWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzg4NjgsImV4cCI6MjA3NDk1NDg2OH0.TVhAlv1Gvb_IwcCzK0KugnNlHenZzEJgAuEkn59cCR0";
}

// Validate Supabase URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  // Add global error handling for network issues
  global: {
    headers: {
      "X-Client-Info": "tryoutkan-web",
    },
  },
});
