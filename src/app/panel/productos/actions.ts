"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, formValues, productSchema, type FormState } from "@/lib/validation";

async function ownBusinessId(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("id").eq("owner_id", userId).maybeSingle();
  return { supabase, businessId: data?.id ?? null };
}

/** HU09: crea o edita un producto del negocio del emprendedor. */
export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireRole(["emprendedor"], "/panel/productos");
  const values = formValues(formData);
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { supabase, businessId } = await ownBusinessId(session.userId);
  if (!businessId) return { message: "Primero registra tu negocio.", values };

  const id = values.id;
  if (id) {
    if (!z.uuid().safeParse(id).success) return { message: "Producto inválido.", values };
    const { error } = await supabase.from("products").update(parsed.data).eq("id", id).eq("business_id", businessId);
    if (error) return { message: "No se pudo guardar el producto.", values };
  } else {
    const { error } = await supabase.from("products").insert({ ...parsed.data, business_id: businessId });
    if (error) return { message: "No se pudo crear el producto.", values };
  }
  revalidatePath("/panel/productos");
  revalidatePath("/vitrina");
  redirect("/panel/productos?guardado=1");
}

export async function toggleProductAction(formData: FormData) {
  const session = await requireRole(["emprendedor"], "/panel/productos");
  const id = z.uuid().parse(formData.get("id"));
  const active = formData.get("active") === "true";
  const { supabase, businessId } = await ownBusinessId(session.userId);
  if (!businessId) return;
  await supabase.from("products").update({ active }).eq("id", id).eq("business_id", businessId);
  revalidatePath("/panel/productos");
  revalidatePath("/vitrina");
}

export async function deleteProductAction(formData: FormData) {
  const session = await requireRole(["emprendedor"], "/panel/productos");
  const id = z.uuid().parse(formData.get("id"));
  const { supabase, businessId } = await ownBusinessId(session.userId);
  if (!businessId) return;
  const { data } = await supabase.from("products").delete().eq("id", id).eq("business_id", businessId).select("image_url").maybeSingle();
  const prefix = "/storage/v1/object/public/productos/";
  if (data?.image_url?.includes(prefix)) {
    await supabase.storage.from("productos").remove([data.image_url.split(prefix)[1]]);
  }
  revalidatePath("/panel/productos");
  revalidatePath("/vitrina");
}
