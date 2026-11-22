import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, Building2, Check, MapPin, Package } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import { LevelBadge } from "@/components/level-badge";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import { formatSoles, LEVELS } from "@/lib/domain";

async function getBusiness(slug: string) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("id, name, slug, category, description, location_type, floor, stand, zone, whatsapp, level, created_at, galleries(name, slug, address)")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: PageProps<"/negocios/[slug]">): Promise<Metadata> {
  const b = await getBusiness((await params).slug);
  return b
    ? { title: `${b.name} · Gamarra Conecta`, description: b.description ?? `${b.category} al por mayor en Gamarra.` }
    : { title: "Negocio no encontrado · Gamarra Conecta" };
}

export default async function NegocioPublicoPage({ params }: PageProps<"/negocios/[slug]">) {
  const business = await getBusiness((await params).slug);
  if (!business) notFound();
  const supabase = await createClient();
  const [{ data: products }, { data: offers }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, category, image_url, price_unit, price_dozen, min_order")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("job_offers")
      .select("id, title, salary, schedule, contract_type")
      .eq("business_id", business.id)
      .eq("status", "abierta"),
  ]);

  const place =
    business.location_type === "galeria"
      ? `${business.galleries?.name ?? "Galería"}${business.floor ? `, piso ${business.floor}` : ""}, stand ${business.stand}`
      : `Vía pública · ${business.zone}`;
  const cards: ProductCardData[] = (products ?? []).map((p) => ({
    ...p,
    business: { name: business.name, slug: business.slug, level: business.level, place },
  }));
  const since = new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(new Date(business.created_at));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-ink-500">
        <Link href="/vitrina" className="hover:text-ink-900">Vitrina</Link> <span aria-hidden>/</span>{" "}
        <span className="text-ink-800">{business.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-brand-200/60 to-saffron-100/60 blur-2xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">{business.category}</span>
              <LevelBadge level={business.level} size="md" />
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{business.name}</h1>
            {business.description && <p className="mt-3 max-w-2xl text-ink-600">{business.description}</p>}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
              <span className="flex items-center gap-1.5">
                {business.location_type === "galeria" ? <Building2 className="size-4 text-brand-600" aria-hidden /> : <MapPin className="size-4 text-brand-600" aria-hidden />}
                {place}
              </span>
              {business.galleries?.address && <span className="text-ink-500">{business.galleries.address}</span>}
              <span className="text-ink-500">En Gamarra Conecta desde {since}</span>
            </div>
            <div id="contacto" className="mt-6" />
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-ink-900">Formalización verificada</p>
          <p className="mt-1 text-xs text-ink-500">Cada paso fue revisado por el gestor de la galería.</p>
          <ol className="mt-4 flex flex-col gap-2.5">
            {LEVELS.map((l) => {
              const ok = l.level <= business.level;
              return (
                <li key={l.level} className="flex items-center gap-3 text-sm">
                  <span className={ok ? "grid size-6 place-items-center rounded-full bg-mint-600 text-white" : "grid size-6 place-items-center rounded-full bg-ink-100 text-ink-400"}>
                    {ok ? <Check className="size-3.5" aria-hidden /> : <span className="text-[10px] font-bold">{l.level}</span>}
                  </span>
                  <span className={ok ? "font-medium text-ink-800" : "text-ink-400"}>{l.level === 0 ? "Negocio registrado" : l.docLabel}</span>
                  <span className="sr-only">{ok ? "verificado" : "pendiente"}</span>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      <section className="mt-10" aria-labelledby="productos">
        <h2 id="productos" className="flex items-center gap-2 text-xl font-semibold text-ink-900">
          <Package className="size-5 text-brand-600" aria-hidden /> Productos al por mayor
        </h2>
        {cards.length ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="Este negocio aún no publica productos" />
          </div>
        )}
      </section>

      {!!offers?.length && (
        <section className="mt-10" aria-labelledby="empleos">
          <h2 id="empleos" className="flex items-center gap-2 text-xl font-semibold text-ink-900">
            <Briefcase className="size-5 text-brand-600" aria-hidden /> Está contratando
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {offers.map((o) => (
              <Link key={o.id} href={`/empleos/${o.id}`} className="group">
                <Card className="flex items-center justify-between gap-3 p-4 transition group-hover:ring-brand-200">
                  <div>
                    <p className="font-medium text-ink-900">{o.title}</p>
                    <p className="text-xs text-ink-500">{o.contract_type} · {o.schedule}</p>
                  </div>
                  <p className="font-semibold text-mint-700">{formatSoles(o.salary)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
