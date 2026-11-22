import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { CalendarClock, FileSignature, MapPin, Users, Wallet } from "lucide-react";
import { Alert, ButtonLink, Card } from "@/components/ui";
import { LevelBadge } from "@/components/level-badge";
import { ApplyForm } from "@/components/apply-form";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { formatSoles } from "@/lib/domain";

export const metadata: Metadata = { title: "Oferta de empleo · Gamarra Conecta" };

export default async function OfertaPage({ params }: PageProps<"/empleos/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: o } = await supabase
    .from("job_offers")
    .select("*, businesses(name, slug, level, location_type, zone, stand, galleries(name))")
    .eq("id", id)
    .eq("status", "abierta")
    .maybeSingle();
  if (!o || !o.businesses) notFound();
  const session = await getSession();
  const { data: mine } =
    session?.profile.role === "trabajador"
      ? await supabase.from("applications").select("status").eq("offer_id", id).eq("worker_id", session.userId).maybeSingle()
      : { data: null };
  const b = o.businesses;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
      <div>
        <Link href="/empleos" className="text-sm text-ink-500 hover:text-ink-900">← Volver a empleos</Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900">{o.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-ink-600">
          <Link href={`/negocios/${b.slug}`} className="font-medium hover:underline">{b.name}</Link>
          <LevelBadge level={b.level} />
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { icon: Wallet, label: "Sueldo mensual", value: formatSoles(o.salary) },
            { icon: FileSignature, label: "Contrato", value: o.contract_type },
            { icon: CalendarClock, label: "Horario", value: o.schedule },
            { icon: Users, label: "Vacantes", value: String(o.vacancies) },
            { icon: MapPin, label: "Lugar", value: b.location_type === "galeria" ? `${b.galleries?.name}, stand ${b.stand}` : `Vía pública · ${b.zone}` },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex items-center gap-3 p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="size-5" aria-hidden /></span>
              <div>
                <p className="text-xs text-ink-500">{label}</p>
                <p className="font-medium text-ink-900">{value}</p>
              </div>
            </Card>
          ))}
        </div>
        <h2 className="mt-8 font-semibold text-ink-900">Funciones y requisitos</h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-600">{o.description}</p>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="p-5">
          <p className="mb-4 font-semibold text-ink-900">Postula a esta oferta</p>
          {!session ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-500">Crea tu cuenta de trabajador (gratis) para postular.</p>
              <ButtonLink href="/registro?rol=trabajador">Crear cuenta de trabajador</ButtonLink>
              <ButtonLink href={`/login?next=/empleos/${o.id}`} variant="secondary">Ya tengo cuenta</ButtonLink>
            </div>
          ) : session.profile.role !== "trabajador" ? (
            <Alert>Solo las cuentas de trabajador pueden postular.</Alert>
          ) : mine ? (
            <Alert tone="success" title="Ya postulaste">Puedes seguir el estado en «Mis postulaciones».</Alert>
          ) : (
            <ApplyForm offerId={o.id} phone={session.profile.phone ?? ""} />
          )}
        </Card>
      </aside>
    </div>
  );
}
