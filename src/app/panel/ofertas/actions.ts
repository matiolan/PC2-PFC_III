"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRmv } from "@/lib/settings";
import { applicationStatusSchema, fieldErrors, formValues, offerSchema, type FormState } from "@/lib/validation";

async function ownBusinessId(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("id").eq("owner_id", userId).maybeSingle();
  return { supabase, businessId: data?.id ?? null };
}

/** HU14: publica o edita una oferta de empleo formal. */
export async function saveOfferAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireRole(["emprendedor"], "/panel/ofertas");
  const values = formValues(formData);
  const parsed = offerSchema(await getRmv()).safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { supabase, businessId } = await ownBusinessId(session.userId);
  if (!businessId) return { message: "Primero registra tu negocio.", values };

  if (values.id) {
    if (!z.uuid().safeParse(values.id).success) return { message: "Oferta inválida.", values };
    const { error } = await supabase.from("job_offers").update(parsed.data).eq("id", values.id).eq("business_id", businessId);
    if (error) return { message: "No se pudo guardar la oferta.", values };
  } else {
    const { error } = await supabase.from("job_offers").insert({ ...parsed.data, business_id: businessId });
    if (error) return { message: error.message.includes("RMV") ? error.message : "No se pudo publicar la oferta.", values };
  }
  revalidatePath("/panel/ofertas");
  revalidatePath("/empleos");
  redirect("/panel/ofertas?guardado=1");
}

export async function setOfferStatusAction(formData: FormData) {
  const session = await requireRole(["emprendedor"], "/panel/ofertas");
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(["abierta", "cerrada"]).parse(formData.get("status"));
  const { supabase, businessId } = await ownBusinessId(session.userId);
  if (!businessId) return;
  await supabase.from("job_offers").update({ status }).eq("id", id).eq("business_id", businessId);
  revalidatePath("/panel/ofertas");
  revalidatePath("/empleos");
}

/** HU16: el empleador cambia el estado de una postulación (RLS valida que la oferta sea suya). */
export async function setApplicationStatusAction(formData: FormData) {
  await requireRole(["emprendedor"], "/panel/ofertas");
  const parsed = applicationStatusSchema.safeParse(formValues(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("applications").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  revalidatePath("/panel/ofertas", "layout");
}
