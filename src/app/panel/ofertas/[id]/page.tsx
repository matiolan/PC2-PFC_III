import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { MessageCircle, Phone, Users } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUS, formatSoles, whatsappUrl } from "@/lib/domain";
import { setApplicationStatusAction } from "../actions";

export const metadata: Metadata = { title: "Postulantes · Gamarra Conecta" };

const dateFmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: "America/Lima" });

/** HU16: el emprendedor revisa a los postulantes y cambia su estado. */
export default async function PostulantesPage({ params }: PageProps<"/panel/ofertas/[id]">) {
  const { id } = await params;
  const session = await requireRole(["emprendedor"], "/panel/ofertas");
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: offer } = await supabase
    .from("job_offers")
    .select("id, title, salary, vacancies, status, businesses!inner(name, owner_id)")
    .eq("id", id)
    .eq("businesses.owner_id", session.userId)
    .maybeSingle();
  if (!offer) notFound();
  const { data: apps } = await supabase
    .from("applications")
    .select("id, message, status, created_at, profiles(full_name, phone)")
    .eq("offer_id", id)
    .order("created_at");

  const selected = apps?.filter((a) => a.status === "seleccionada").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/ofertas" className="text-sm text-ink-500 hover:text-ink-900">← Mis ofertas</Link>
      <PageHeader
        eyebrow="Postulantes"
        title={offer.title}
        description={`${formatSoles(offer.salary)} · ${offer.vacancies} vacante(s) · ${selected} seleccionado(s)`}
        actions={<Badge tone={offer.status === "abierta" ? "success" : "neutral"}>{offer.status === "abierta" ? "Convocatoria abierta" : "Cerrada"}</Badge>}
      />
      {!apps?.length ? (
        <EmptyState icon={<Users className="size-6" />} title="Aún no hay postulantes" description="Comparte la oferta: aparece en la bolsa de empleo y en la ficha de tu negocio." />
      ) : (
        <div className="grid gap-4">
          {apps.map((a) => {
            const st = APPLICATION_STATUS[a.status];
            const phone = a.profiles?.phone ?? "";
            return (
              <Card key={a.id} className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">{a.profiles?.full_name ?? "Postulante"}</p>
                    <p className="text-xs text-ink-500">Postuló el {dateFmt.format(new Date(a.created_at))}</p>
                  </div>
                  <Badge tone={st?.tone}>{st?.label ?? a.status}</Badge>
                </div>
                {a.message && <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-700 ring-1 ring-ink-100">“{a.message}”</p>}
                <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  {/^9\d{8}$/.test(phone) && (
                    <>
                      <a href={`tel:+51${phone}`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50">
                        <Phone className="size-3.5" aria-hidden /> {phone}
                      </a>
                      <a
                        href={whatsappUrl(phone, `Hola ${a.profiles?.full_name?.split(" ")[0] ?? ""}, te escribimos de ${offer.businesses.name} por tu postulación a «${offer.title}».`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#e8f8ee] px-2.5 py-1.5 text-sm text-[#146c36] hover:bg-[#d3f2df]"
                      >
                        <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                      </a>
                    </>
                  )}
                  <form action={setApplicationStatusAction} className="ml-auto flex flex-wrap gap-1.5">
                    <input type="hidden" name="id" value={a.id} />
                    {(["en_revision", "seleccionada", "descartada"] as const).map((s) => (
                      <button
                        key={s}
                        name="status"
                        value={s}
                        disabled={a.status === s}
                        className={
                          s === "seleccionada"
                            ? "rounded-lg bg-mint-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-mint-700 disabled:opacity-40"
                            : s === "descartada"
                              ? "rounded-lg px-3 py-1.5 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-40"
                              : "rounded-lg px-3 py-1.5 text-sm text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50 disabled:opacity-40"
                        }
                      >
                        {s === "en_revision" ? "En revisión" : s === "seleccionada" ? "Seleccionar" : "Descartar"}
                      </button>
                    ))}
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
