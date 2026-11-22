import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/domain";
import type { Tables } from "@/lib/database.types";

export type Session = {
  userId: string;
  email: string;
  profile: Tables<"profiles"> & { role: Role };
};

/** Usuario autenticado y su perfil. Se valida el JWT con getClaims (no confía en la cookie a ciegas). */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", claims.sub).single();
  if (!profile) return null;
  return { userId: claims.sub, email: String(claims.email ?? ""), profile: profile as Session["profile"] };
});

export async function requireSession(next = "/panel"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}

/** Autorización por rol en el servidor (HU03). La base de datos lo vuelve a validar con RLS. */
export async function requireRole(roles: Role[], next = "/panel"): Promise<Session> {
  const session = await requireSession(next);
  if (!roles.includes(session.profile.role)) redirect("/panel?acceso=denegado");
  return session;
}
