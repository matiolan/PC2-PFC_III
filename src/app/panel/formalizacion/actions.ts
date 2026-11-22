"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { evidenceSchema, fieldErrors, type FormState } from "@/lib/validation";

/**
 * HU06: registra la evidencia ya subida al bucket privado.
 * El archivo viaja directo del navegador a Supabase Storage (la política solo permite
 * escribir en la carpeta del propio usuario); aquí se valida y se registra en la BD.
 */
export async function registerEvidenceAction(input: {
  level: number;
  doc_number: string;
  file_path: string;
}): Promise<FormState> {
  const session = await requireRole(["emprendedor"], "/panel/formalizacion");
  const parsed = evidenceSchema.safeParse(input);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Revisa los datos del documento." };

  const { level, doc_number, doc_type, file_path } = parsed.data;
  if (!file_path.startsWith(`${session.userId}/`)) return { message: "El archivo no pertenece a tu cuenta." };

  const limit = rateLimit(`evidence:${session.userId}`, 10, 60 * 60_000);
  if (!limit.ok) return { message: "Subiste demasiados documentos en poco tiempo. Inténtalo más tarde." };

  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, level")
    .eq("owner_id", session.userId)
    .single();
  if (!business) return { message: "Primero registra tu negocio." };
  if (level !== business.level + 1) return { message: "Solo puedes enviar el documento del siguiente nivel." };

  // Confirma que el archivo existe en la carpeta del usuario.
  const [folder, name] = file_path.split("/");
  const { data: files } = await supabase.storage.from("evidencias").list(folder, { search: name, limit: 1 });
  if (!files?.length) return { message: "No encontramos el archivo subido. Vuelve a intentarlo." };

  const { error } = await supabase
    .from("formalization_evidence")
    .insert({ business_id: business.id, level, doc_type, doc_number, file_path });
  if (error) {
    await supabase.storage.from("evidencias").remove([file_path]);
    const msg = error.code === "23505" ? "Ya tienes un documento en revisión para este nivel." : "No se pudo registrar el documento.";
    return { message: msg };
  }
  revalidatePath("/panel/formalizacion");
  revalidatePath("/panel");
  return { ok: true, message: "¡Documento enviado! El gestor de tu galería lo revisará en menos de 48 horas." };
}
