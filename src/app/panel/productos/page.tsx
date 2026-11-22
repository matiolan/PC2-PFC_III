import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Alert, Badge, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dozenSavings, formatSoles } from "@/lib/domain";
import { deleteProductAction, toggleProductAction } from "./actions";

export const metadata: Metadata = { title: "Mis productos · Gamarra Conecta" };

export default async function ProductosPage({ searchParams }: PageProps<"/panel/productos">) {
  const session = await requireRole(["emprendedor"], "/panel/productos");
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", session.userId).maybeSingle();
  if (!business) redirect("/panel/negocio");
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  const sp = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      {sp.guardado && <Alert tone="success">Producto guardado.</Alert>}
      <PageHeader
        eyebrow="Vitrina mayorista"
        title="Mis productos"
        description="Publica tus productos con precio por unidad y por docena; los compradores cotizan contigo por WhatsApp."
        actions={
          <ButtonLink href="/panel/productos/nuevo">
            <Plus className="size-4" aria-hidden /> Nuevo producto
          </ButtonLink>
        }
      />
      {!products?.length ? (
        <EmptyState
          icon={<Package className="size-6" />}
          title="Aún no tienes productos"
          description="Publica el primero: tarda menos de un minuto."
          action={<ButtonLink href="/panel/productos/nuevo">Publicar producto</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className={p.active ? "overflow-hidden" : "overflow-hidden opacity-70"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url ?? "/productos/polo.svg"} alt="" className="aspect-[10/7] w-full object-cover" />
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink-900">{p.name}</p>
                  {!p.active && <Badge>Oculto</Badge>}
                </div>
                <p className="text-xs text-ink-500">{p.category} · pedido mínimo {p.min_order}</p>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-xs text-ink-500">Unidad</p>
                    <p className="font-semibold text-ink-900">{formatSoles(p.price_unit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Docena</p>
                    <p className="font-semibold text-brand-700">{formatSoles(p.price_dozen)}</p>
                  </div>
                  {dozenSavings(p.price_unit, p.price_dozen) > 0 && (
                    <Badge tone="success" className="mb-0.5">Ahorra {formatSoles(dozenSavings(p.price_unit, p.price_dozen))}</Badge>
                  )}
                </div>
                <div className="mt-2 flex gap-1 border-t border-ink-100 pt-3">
                  <Link href={`/panel/productos/${p.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-100">
                    <Pencil className="size-3.5" aria-hidden /> Editar
                  </Link>
                  <form action={toggleProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={String(!p.active)} />
                    <button className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-100">
                      {p.active ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                      {p.active ? "Ocultar" : "Publicar"}
                    </button>
                  </form>
                  <form action={deleteProductAction} className="ml-auto">
                    <input type="hidden" name="id" value={p.id} />
                    <button className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-red-600 hover:bg-red-50" aria-label={`Eliminar ${p.name}`}>
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
