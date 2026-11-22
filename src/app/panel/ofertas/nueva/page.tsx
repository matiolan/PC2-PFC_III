import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { OfferForm } from "@/components/offer-form";
import { requireRole } from "@/lib/auth";
import { getRmv } from "@/lib/settings";

export const metadata: Metadata = { title: "Nueva oferta · Gamarra Conecta" };

export default async function NuevaOfertaPage() {
  await requireRole(["emprendedor"], "/panel/ofertas/nueva");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Bolsa de empleo formal" title="Nueva oferta de empleo" />
      <OfferForm rmv={await getRmv()} />
    </div>
  );
}
