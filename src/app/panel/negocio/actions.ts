"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/domain";
import { businessSchema, fieldErrors, formValues, type FormState } from "@/lib/validation";

/** HU04: crea o actualiza el negocio del emprendedor autenticado. */
export async function saveBusinessAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireRole(["emprendedor"], "/panel/negocio");
  const values = formValues(formData);
  const parsed = businessSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", session.userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("businesses").update(parsed.data).eq("id", existing.id);
    if (error) return { message: "No se pudo guardar. Revisa los datos e inténtalo otra vez.", values };
    revalidatePath("/panel/negocio");
    return { ok: true, message: "Los datos de tu negocio se actualizaron." };
  }

  // Identificador único para la URL pública del negocio.
  const base = slugify(parsed.data.name) || "negocio";
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const { count } = await supabase.from("businesses").select("id", { count: "exact", head: true }).eq("slug", slug);
    if (!count) break;
    slug = `${base}-${i}`;
  }

  const { error } = await supabase.from("businesses").insert({ ...parsed.data, owner_id: session.userId, slug });
  if (error) return { message: "No se pudo registrar el negocio. Inténtalo nuevamente.", values };
  revalidatePath("/panel");
  redirect("/panel/formalizacion?nuevo=1");
}
