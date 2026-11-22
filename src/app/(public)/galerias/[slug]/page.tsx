import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import { LevelBadge } from "@/components/level-badge";
import { createClient } from "@/lib/supabase/server";
import { rankByFormalization } from "@/lib/domain";

export const metadata: Metadata = { title: "Galería · Gamarra Conecta" };

export default async function GaleriaPage({ params }: PageProps<"/galerias/[slug]">) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) notFound();
  const supabase = await createClient();
  const { data: g } = await supabase.from("galleries").select("*").eq("slug", slug).maybeSingle();
  if (!g) notFound();
  const { data } = await supabase
    .from("businesses")
    .select("id, name, slug, category, floor, stand, level, created_at, description")
    .eq("gallery_id", g.id);
  const businesses = rankByFormalization(data ?? []);
  const floors = [...new Set(businesses.map((b) => b.floor ?? "—"))].sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/galerias" className="text-sm text-ink-500 hover:text-ink-900">← Galerías</Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{g.name}</h1>
      <p className="mt-2 flex items-center gap-1 text-ink-500"><MapPin className="size-4" aria-hidden /> {g.address} · {g.floors} pisos</p>
      {g.description && <p className="mt-2 max-w-2xl text-ink-600">{g.description}</p>}
      {businesses.length === 0 ? (
        <div className="mt-8"><EmptyState title="Aún no hay negocios registrados en esta galería" /></div>
      ) : (
        floors.map((floor) => (
          <section key={floor} className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">Piso {floor}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.filter((b) => (b.floor ?? "—") === floor).map((b) => (
                <Link key={b.id} href={`/negocios/${b.slug}`} className="group">
                  <Card className="flex h-full flex-col gap-2 p-4 transition group-hover:ring-brand-200">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-ink-900 group-hover:text-brand-700">{b.name}</p>
                      <LevelBadge level={b.level} />
                    </div>
                    <p className="text-xs text-ink-500">{b.category} · stand {b.stand}</p>
                    {b.description && <p className="line-clamp-2 text-sm text-ink-600">{b.description}</p>}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
