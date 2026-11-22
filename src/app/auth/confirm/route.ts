import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validation";

/**
 * Verifica los enlaces de correo (confirmación de cuenta y recuperación de contraseña).
 * Supabase usa el flujo PKCE: el enlace trae un `code` de un solo uso que se canjea por
 * la sesión. Si el canje falla (código ausente, vencido o reutilizado) se rechaza.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(searchParams.get("code") ?? "");
  const destination = error ? "/login?error=enlace" : next;
  return NextResponse.redirect(new URL(destination, origin));
}
