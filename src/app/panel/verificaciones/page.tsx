import type { Metadata } from "next";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { levelInfo } from "@/lib/domain";

export const metadata: Metadata = { title: "Verificaciones · Gamarra Conecta" };

const dateFmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

export default async function VerificacionesPage() {
  const { profile } = await requireRole(["gestor"], "/panel/verificaciones");
  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("formalization_evidence")
    .select("id, level, doc_type, doc_number, created_at, businesses(name, location_type, galleries(name))")
    .eq("status", "pendiente")
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Gestor de galería"
        title="Verificaciones pendientes"
        description={
          profile.gallery_id
            ? "Evidencias de los negocios de tu galería."
            : "Evidencias de todos los negocios de la asociación (galerías y vía pública)."
        }
      />
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <ShieldCheck className="size-4 text-mint-600" aria-hidden /> Solo los gestores pueden ver esta sección y los
        documentos se abren con enlaces temporales.
      </div>
      {!pending?.length ? (
        <EmptyState icon={<ClipboardCheck className="size-6" />} title="No hay evidencias pendientes" description="Cuando un emprendedor suba un documento aparecerá aquí." />
      ) : (
        <Card className="divide-y divide-ink-100">
          {pending.map((e) => {
            const info = levelInfo(e.level);
            return (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink-900">{e.businesses?.name}</p>
                  <p className="text-xs text-ink-500">
                    {e.businesses?.location_type === "galeria" ? e.businesses?.galleries?.name : "Vía pública"} ·{" "}
                    {dateFmt.format(new Date(e.created_at))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="brand">Nivel {info.level} · {info.name}</Badge>
                  <Badge>{info.docLabel}</Badge>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
