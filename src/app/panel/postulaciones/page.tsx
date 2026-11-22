import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Badge, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUS as STATUS, formatSoles } from "@/lib/domain";

export const metadata: Metadata = { title: "Mis postulaciones · Gamarra Conecta" };


export default async function PostulacionesPage() {
  const session = await requireRole(["trabajador"], "/panel/postulaciones");
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("id, status, created_at, job_offers(id, title, salary, status, businesses(name))")
    .eq("worker_id", session.userId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Trabajador" title="Mis postulaciones" description="Sigue el estado de cada postulación." actions={<ButtonLink href="/empleos" variant="secondary">Buscar empleos</ButtonLink>} />
      {!data?.length ? (
        <EmptyState icon={<Briefcase className="size-6" />} title="Aún no postulas" description="Encuentra empleos formales en Gamarra." action={<ButtonLink href="/empleos">Ver ofertas</ButtonLink>} />
      ) : (
        <Card className="divide-y divide-ink-100">
          {data.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/empleos/${a.job_offers?.id}`} className="font-medium text-ink-900 hover:underline">{a.job_offers?.title}</Link>
                <p className="text-xs text-ink-500">{a.job_offers?.businesses?.name} · {a.job_offers ? formatSoles(a.job_offers.salary) : ""}</p>
              </div>
              <Badge tone={STATUS[a.status]?.tone ?? "neutral"}>{STATUS[a.status]?.label ?? a.status}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
