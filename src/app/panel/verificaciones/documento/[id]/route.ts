import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Abre el documento con una URL firmada de 5 minutos (solo gestores; RLS limita su ámbito). */
export async function GET(request: NextRequest, ctx: RouteContext<"/panel/verificaciones/documento/[id]">) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session || session.profile.role !== "gestor" || !z.uuid().safeParse(id).success) {
    return new NextResponse("No autorizado", { status: 403 });
  }
  const supabase = await createClient();
  const { data: evidence } = await supabase.from("formalization_evidence").select("file_path").eq("id", id).maybeSingle();
  if (!evidence) return new NextResponse("No encontrado", { status: 404 });

  if (evidence.file_path.startsWith("demo/")) {
    return NextResponse.redirect(new URL("/documento-demo.svg", request.nextUrl.origin));
  }
  const { data, error } = await supabase.storage.from("evidencias").createSignedUrl(evidence.file_path, 300);
  if (error || !data) return new NextResponse("No se pudo generar el enlace", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
