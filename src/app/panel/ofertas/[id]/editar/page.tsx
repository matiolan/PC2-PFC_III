import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/ui";
import { OfferForm } from "@/components/offer-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRmv } from "@/lib/settings";

export const metadata: Metadata = { title: "Editar oferta · Gamarra Conecta" };

export default async function EditarOfertaPage({ params }: PageProps<"/panel/ofertas/[id]/editar">) {
  const { id } = await params;
  const session = await requireRole(["emprendedor"], "/panel/ofertas");
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: offer } = await supabase
    .from("job_offers")
    .select("*, businesses!inner(owner_id)")
    .eq("id", id)
    .eq("businesses.owner_id", session.userId)
    .maybeSingle();
  if (!offer) notFound();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Bolsa de empleo formal" title={`Editar «${offer.title}»`} />
      <OfferForm offer={offer} rmv={await getRmv()} />
    </div>
  );
}
