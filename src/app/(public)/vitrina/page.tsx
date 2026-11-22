import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { ButtonLink, EmptyState } from "@/components/ui";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, rankByFormalization, sanitizeSearch } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Vitrina mayorista · Gamarra Conecta",
  description: "Productos de Gamarra al por mayor con precio por docena, de negocios con formalización verificada.",
};

const PAGE = 24;

export default async function VitrinaPage({ searchParams }: PageProps<"/vitrina">) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = sanitizeSearch(one("q"));
  const categoria = (CATEGORIES as readonly string[]).includes(one("categoria")) ? one("categoria") : "";
  const galeria = one("galeria");
  const nivel = Math.min(Math.max(Number(one("nivel")) || 0, 0), 4);
  const limit = Math.min(Math.max(Number(one("mostrar")) || PAGE, PAGE), 200);

  const supabase = await createClient();
  const { data: galleries } = await supabase.from("galleries").select("id, name").order("name");

  // HU10: búsqueda por texto, categoría y galería.
  let query = supabase
    .from("products")
    .select(
      "id, name, category, image_url, price_unit, price_dozen, min_order, created_at, businesses!inner(name, slug, level, whatsapp, location_type, zone, gallery_id, galleries(name))",
      { count: "exact" },
    )
    .eq("active", true);
  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  if (categoria) query = query.eq("category", categoria);
  if (galeria === "via-publica") query = query.eq("businesses.location_type", "via_publica");
  else if (/^[0-9a-f-]{36}$/.test(galeria)) query = query.eq("businesses.gallery_id", galeria);
  if (nivel > 0) query = query.gte("businesses.level", nivel);

  const { data, count } = await query.order("created_at", { ascending: false }).limit(200);

  // HU13: primero los negocios con mayor nivel de formalización; a igual nivel, lo más reciente.
  const ranked = rankByFormalization((data ?? []).map((p) => ({ ...p, level: p.businesses.level }))).slice(0, limit);

  const products: ProductCardData[] = ranked.map((p) => ({
    ...p,
    business: {
      name: p.businesses.name,
      slug: p.businesses.slug,
      level: p.businesses.level,
      whatsapp: p.businesses.whatsapp,
      place: p.businesses.location_type === "galeria" ? (p.businesses.galleries?.name ?? "Galería") : `Vía pública · ${p.businesses.zone ?? ""}`,
    },
  }));

  const moreParams = new URLSearchParams(Object.entries({ q, categoria, galeria, nivel: nivel ? String(nivel) : "" }).filter(([, v]) => v));
  moreParams.set("mostrar", String(limit + PAGE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Vitrina mayorista</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Compra por docena directo a Gamarra</h1>
        <p className="mt-2 text-ink-500">
          Compara precios por unidad y por docena. Los negocios con mayor nivel de formalización aparecen primero: su insignia
          fue verificada por el gestor de la galería.
        </p>
      </div>
      <CatalogFilters galleries={galleries ?? []} />
      <p className="mt-6 text-sm text-ink-500" aria-live="polite">
        {count ?? 0} producto(s){q && <> para «{q}»</>}
      </p>
      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<PackageSearch className="size-6" />} title="No encontramos productos" description="Prueba con otra palabra o quita algún filtro." />
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      )}
      {(count ?? 0) > products.length && (
        <div className="mt-10 flex justify-center">
          <ButtonLink href={`/vitrina?${moreParams.toString()}`} variant="secondary" scroll={false}>
            Ver más productos
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
