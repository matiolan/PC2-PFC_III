import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/** Cliente de Supabase para Client Components (usa solo la anon/publishable key). */
export function createClient() {
  const env = getPublicEnv();
  if (!env) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
