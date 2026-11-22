import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BusinessForm } from "./business-form";

export const metadata: Metadata = { title: "Mi negocio · Gamarra Conecta" };

export default async function NegocioPage() {
  const session = await requireRole(["emprendedor"], "/panel/negocio");
  const supabase = await createClient();
  const [{ data: business }, { data: galleries }] = await Promise.all([
    supabase.from("businesses").select("*").eq("owner_id", session.userId).maybeSingle(),
    supabase.from("galleries").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Emprendedor"
        title={business ? "Datos de mi negocio" : "Registra tu negocio"}
        description={
          business
            ? "Mantén tus datos al día: los compradores los ven en tu ficha pública."
            : "Funciona igual si estás en una galería o vendes en la vía pública. Empiezas en el nivel 0 «Registrado»."
        }
      />
      <BusinessForm business={business} galleries={galleries ?? []} />
    </div>
  );
}
