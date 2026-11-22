import type { Metadata } from "next";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { levelInfo } from "@/lib/domain";
import { ReviewCard, type PendingEvidence } from "./review-card";

export const metadata: Metadata = { title: "Verificaciones · Gamarra Conecta" };

const dateFmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

export default async function VerificacionesPage() {
  const { profile } = await requireRole(["gestor"], "/panel/verificaciones");
  const supabase = await createClient();
  const select =
    "id, level, doc_type, doc_number, status, review_note, created_at, reviewed_at, businesses(name, location_type, zone, stand, owner_id, galleries(name), profiles(full_name))";
  const [{ data: pending }, { data: reviewed }] = await Promise.all([
    supabase.from("formalization_evidence").select(select).eq("status", "pendiente").order("created_at"),
    supabase
      .from("formalization_evidence")
      .select(select)
      .neq("status", "pendiente")
      .order("reviewed_at", { ascending: false })
      .limit(8),
  ]);

  const items: PendingEvidence[] = (pending ?? []).map((e) => {
    const info = levelInfo(e.level);
    const b = e.businesses;
    return {
      id: e.id,
      businessName: b?.name ?? "",
      owner: b?.profiles?.full_name ?? "",
      place: b?.location_type === "galeria" ? `${b?.galleries?.name ?? ""}, stand ${b?.stand ?? ""}` : `Vía pública · ${b?.zone ?? ""}`,
      levelLabel: `Nivel ${info.level} · ${info.name}`,
      docLabel: info.docLabel,
      docNumber: e.doc_number,
      createdAt: dateFmt.format(new Date(e.created_at)),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Gestor de galería"
        title="Verificaciones"
        description={
          profile.gallery_id
            ? "Evidencias de los negocios de tu galería."
            : "Evidencias de todos los negocios de la asociación (galerías y vía pública)."
        }
        actions={<Badge tone={items.length ? "warning" : "success"}>{items.length} pendiente(s)</Badge>}
      />
      <p className="flex items-center gap-2 text-xs text-ink-500">
        <ShieldCheck className="size-4 text-mint-600" aria-hidden /> Sección exclusiva del gestor. Los documentos se abren con
        enlaces temporales de 5 minutos y cada decisión queda en la auditoría.
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="size-6" />}
          title="¡Todo al día!"
          description="No hay evidencias pendientes. Cuando un emprendedor suba un documento aparecerá aquí."
        />
      ) : (
        <Card className="divide-y divide-ink-100">
          {items.map((item) => (
            <ReviewCard key={item.id} item={item} />
          ))}
        </Card>
      )}

      {!!reviewed?.length && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink-700">Revisadas recientemente</h2>
          <Card className="divide-y divide-ink-100">
            {reviewed.map((e) => {
              const info = levelInfo(e.level);
              return (
                <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className="font-medium text-ink-800">{e.businesses?.name}</span>
                  <span className="text-ink-500">{info.docLabel}</span>
                  <Badge tone={e.status === "aprobada" ? "success" : "danger"}>{e.status === "aprobada" ? "Aprobada" : "Observada"}</Badge>
                  <span className="text-xs text-ink-400">{e.reviewed_at ? dateFmt.format(new Date(e.reviewed_at)) : ""}</span>
                </div>
              );
            })}
          </Card>
        </section>
      )}
    </div>
  );
}
