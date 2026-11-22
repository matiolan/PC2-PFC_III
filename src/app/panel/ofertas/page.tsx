import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Plus, Users } from "lucide-react";
import { Alert, Badge, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatSoles } from "@/lib/domain";
import { setOfferStatusAction } from "./actions";

export const metadata: Metadata = { title: "Ofertas de empleo · Gamarra Conecta" };

export default async function OfertasPage({ searchParams }: PageProps<"/panel/ofertas">) {
  const session = await requireRole(["emprendedor"], "/panel/ofertas");
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", session.userId).maybeSingle();
  if (!business) redirect("/panel/negocio");
  const { data: offers } = await supabase
    .from("job_offers")
    .select("*, applications(count)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  const sp = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      {sp.guardado && <Alert tone="success">Oferta guardada.</Alert>}
      <PageHeader
        eyebrow="Bolsa de empleo formal"
        title="Mis ofertas de empleo"
        description="Contrata con sueldo, horario y contrato claros. Revisa a tus postulantes en cada oferta."
        actions={
          <ButtonLink href="/panel/ofertas/nueva">
            <Plus className="size-4" aria-hidden /> Nueva oferta
          </ButtonLink>
        }
      />
      {!offers?.length ? (
        <EmptyState icon={<Briefcase className="size-6" />} title="Aún no publicas ofertas" action={<ButtonLink href="/panel/ofertas/nueva">Publicar oferta</ButtonLink>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map((o) => {
            const count = o.applications?.[0]?.count ?? 0;
            return (
              <Card key={o.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink-900">{o.title}</p>
                    <p className="text-xs text-ink-500">{o.contract_type} · {o.schedule}</p>
                  </div>
                  <Badge tone={o.status === "abierta" ? "success" : "neutral"}>{o.status === "abierta" ? "Abierta" : "Cerrada"}</Badge>
                </div>
                <p className="text-xl font-semibold text-ink-900">{formatSoles(o.salary)} <span className="text-xs font-normal text-ink-500">/ mes · {o.vacancies} vacante(s)</span></p>
                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  <ButtonLink href={`/panel/ofertas/${o.id}`} size="sm">
                    <Users className="size-4" aria-hidden /> {count} postulante(s)
                  </ButtonLink>
                  <Link href={`/panel/ofertas/${o.id}/editar`} className="rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-100">Editar</Link>
                  <form action={setOfferStatusAction} className="ml-auto">
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="status" value={o.status === "abierta" ? "cerrada" : "abierta"} />
                    <button className="rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-100">{o.status === "abierta" ? "Cerrar convocatoria" : "Reabrir"}</button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
