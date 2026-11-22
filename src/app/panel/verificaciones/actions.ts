"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, formValues, reviewSchema, type FormState } from "@/lib/validation";

/**
 * HU07: el gestor aprueba u observa una evidencia. La BD registra revisor y fecha,
 * recalcula el nivel del negocio y escribe la auditoría (triggers).
 */
export async function reviewEvidenceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole(["gestor"], "/panel/verificaciones");
  const parsed = reviewSchema.safeParse(formValues(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formalization_evidence")
    .update({ status: parsed.data.decision, review_note: parsed.data.note || null })
    .eq("id", parsed.data.id)
    .eq("status", "pendiente")
    .select("id")
    .maybeSingle();

  if (error || !data) return { message: "No se pudo registrar la revisión (quizá ya fue revisada)." };
  revalidatePath("/panel/verificaciones");
  revalidatePath("/panel");
  return {
    ok: true,
    message: parsed.data.decision === "aprobada" ? "Evidencia aprobada: el nivel del negocio se actualizó." : "Evidencia observada: el emprendedor verá el motivo.",
  };
}
