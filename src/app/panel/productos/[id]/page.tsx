import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/product-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Editar producto · Gamarra Conecta" };

export default async function EditarProductoPage({ params }: PageProps<"/panel/productos/[id]">) {
  const { id } = await params;
  const session = await requireRole(["emprendedor"], `/panel/productos/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", session.userId).maybeSingle();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("business_id", business?.id ?? "")
    .maybeSingle();
  if (!product) notFound();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Mis productos" title={`Editar «${product.name}»`} />
      <ProductForm product={product} userId={session.userId} />
    </div>
  );
}
