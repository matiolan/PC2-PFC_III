import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RMV } from "@/lib/domain";

/** RMV vigente configurable desde la base de datos (app_settings). */
export async function getRmv(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", "rmv").maybeSingle();
  return Number(data?.value ?? DEFAULT_RMV);
}
