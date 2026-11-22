import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { badgeSvg } from "@/lib/badge-svg";

/** Insignia pública en SVG: /insignia/<slug-del-negocio> */
export async function GET(_req: Request, ctx: RouteContext<"/insignia/[slug]">) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return new NextResponse("No encontrado", { status: 404 });
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("name, level").eq("slug", slug).maybeSingle();
  if (!data) return new NextResponse("No encontrado", { status: 404 });
  return new NextResponse(badgeSvg(data.name, data.level), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
