import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pc2-pfc-iii.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = ["", "/vitrina", "/galerias", "/empleos", "/registro", "/login"].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: p === "" ? 1 : 0.7,
  }));
  try {
    const supabase = await createClient();
    const [{ data: b }, { data: g }] = await Promise.all([
      supabase.from("businesses").select("slug, updated_at"),
      supabase.from("galleries").select("slug"),
    ]);
    return [
      ...base,
      ...(b ?? []).map((x) => ({ url: `${SITE}/negocios/${x.slug}`, lastModified: new Date(x.updated_at) })),
      ...(g ?? []).map((x) => ({ url: `${SITE}/galerias/${x.slug}`, lastModified: now })),
    ];
  } catch {
    return base;
  }
}
