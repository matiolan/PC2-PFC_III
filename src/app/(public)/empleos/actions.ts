"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { applicationSchema, fieldErrors, formValues, type FormState } from "@/lib/validation";

/** HU15: el trabajador postula a una oferta abierta (una sola vez por oferta). */
export async function applyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { message: "Inicia sesión como trabajador para postular." };
  if (session.profile.role !== "trabajador") return { message: "Solo las cuentas de trabajador pueden postular." };

  const values = formValues(formData);
  const parsed = applicationSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const limit = rateLimit(`apply:${session.userId}`, 20, 60 * 60_000);
  if (!limit.ok) return { message: "Enviaste muchas postulaciones seguidas. Inténtalo más tarde.", values };

  const supabase = await createClient();
  await supabase.from("profiles").update({ phone: parsed.data.phone }).eq("id", session.userId);
  const { error } = await supabase
    .from("applications")
    .insert({ offer_id: parsed.data.offer_id, worker_id: session.userId, message: parsed.data.message || null });
  if (error) {
    return {
      message: error.code === "23505" ? "Ya postulaste a esta oferta." : "No se pudo enviar la postulación (la oferta podría estar cerrada).",
      values,
    };
  }
  revalidatePath("/panel/postulaciones");
  return { ok: true, message: "¡Postulación enviada! El empleador te contactará por teléfono o WhatsApp." };
}
