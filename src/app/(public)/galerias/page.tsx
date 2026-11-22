import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Layers, MapPin } from "lucide-react";
import { Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Directorio de galerías · Gamarra Conecta",
  description: "Galerías de Gamarra con sus negocios y nivel de formalización para planificar tu visita.",
};

/** HU21: directorio de galerías con conteo de negocios y formalizados. */
export default async function GaleriasPage() {
  const supabase = await createClient();
  const [{ data: galleries }, { data: businesses }] = await Promise.all([
    supabase.from("galleries").select("id, name, slug, address, floors, description").order("name"),
    supabase.from("businesses").select("gallery_id, level, location_type"),
  ]);
  const stats = new Map<string, { total: number; formal: number }>();
  for (const b of businesses ?? []) {
    if (!b.gallery_id) continue;
    const s = stats.get(b.gallery_id) ?? { total: 0, formal: 0 };
    s.total += 1;
    if (b.level >= 2) s.formal += 1;
    stats.set(b.gallery_id, s);
  }
  const street = (businesses ?? []).filter((b) => b.location_type === "via_publica").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Directorio</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Galerías de Gamarra</h1>
      <p className="mt-2 max-w-2xl text-ink-500">Planifica tu visita: revisa qué negocios hay en cada galería, en qué piso están y cuántos ya están formalizados.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(galleries ?? []).map((g) => {
          const s = stats.get(g.id) ?? { total: 0, formal: 0 };
          const pct = s.total ? Math.round((s.formal / s.total) * 100) : 0;
          return (
            <Link key={g.id} href={`/galerias/${g.slug}`} className="group">
              <Card className="relative flex h-full flex-col gap-4 overflow-hidden p-6 transition group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
                <div aria-hidden className="absolute -right-10 -top-10 size-36 rounded-full bg-gradient-to-br from-brand-100 to-saffron-100 opacity-70 transition group-hover:scale-125" />
                <span className="relative grid size-12 place-items-center rounded-2xl bg-ink-900 text-white">
                  <Building2 className="size-6" aria-hidden />
                </span>
                <div className="relative">
                  <h2 className="text-lg font-semibold text-ink-900">{g.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-ink-500"><MapPin className="size-3.5" aria-hidden /> {g.address}</p>
                  {g.description && <p className="mt-2 text-sm text-ink-600">{g.description}</p>}
                </div>
                <div className="relative mt-auto flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-ink-500"><Layers className="size-3.5" aria-hidden /> {g.floors} pisos · {s.total} negocios</span>
                  <span className="font-semibold text-mint-700">{pct}% con RUC</span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-mint-500 to-brand-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="relative flex items-center gap-1 text-sm font-medium text-brand-600">
                  Ver negocios <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm text-ink-600"><strong className="text-ink-900">{street} negocios de la vía pública</strong> también están en la plataforma y avanzan en su formalización.</p>
        <Link href="/vitrina?galeria=via-publica" className="text-sm font-medium text-brand-600 hover:underline">Ver sus productos →</Link>
      </Card>
    </div>
  );
}
