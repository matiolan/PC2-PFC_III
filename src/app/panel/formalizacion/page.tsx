import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, Card, PageHeader } from "@/components/ui";
import { FormalizationRoute, type StepEvidence } from "@/components/formalization-route";
import { EvidenceUploader } from "@/components/evidence-uploader";
import { LevelBadge } from "@/components/level-badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formalizationPercent, levelInfo } from "@/lib/domain";

export const metadata: Metadata = { title: "Ruta de formalización · Gamarra Conecta" };

export default async function FormalizacionPage({ searchParams }: PageProps<"/panel/formalizacion">) {
  const session = await requireRole(["emprendedor"], "/panel/formalizacion");
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, level")
    .eq("owner_id", session.userId)
    .maybeSingle();
  if (!business) redirect("/panel/negocio");

  const { data: evidence } = await supabase
    .from("formalization_evidence")
    .select("level, status, review_note, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  // La evidencia más reciente de cada nivel define su estado.
  const byLevel: Record<number, StepEvidence> = {};
  for (const e of evidence ?? []) byLevel[e.level] ??= e;

  const sp = await searchParams;
  const current = levelInfo(business.level);
  const percent = formalizationPercent(business.level);

  return (
    <div className="flex flex-col gap-6">
      {sp.nuevo && (
        <Alert tone="success" title="¡Negocio registrado!">
          Ya estás en el nivel 0. Sigue la ruta para ganar tu primera insignia.
        </Alert>
      )}
      <PageHeader
        eyebrow={business.name}
        title="Ruta de formalización"
        description="Cada nivel aprobado por el gestor mejora tu insignia y tu posición en la vitrina."
      />
      <Card className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <div>
          <p className="text-sm text-ink-500">Nivel actual</p>
          <p className="flex flex-wrap items-center gap-3 text-2xl font-semibold text-ink-900">
            {current.level} · {current.name} <LevelBadge level={business.level} size="md" />
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de formalización">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-saffron-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight text-brand-700">{percent}%</p>
      </Card>
      <FormalizationRoute
        level={business.level}
        evidenceByLevel={byLevel}
        nextStepSlot={
          business.level < 4 && byLevel[business.level + 1]?.status !== "pendiente" ? (
            <EvidenceUploader userId={session.userId} level={business.level + 1} />
          ) : null
        }
      />
    </div>
  );
}
