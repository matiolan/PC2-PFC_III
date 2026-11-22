import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/product-form";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Nuevo producto · Gamarra Conecta" };

export default async function NuevoProductoPage() {
  const session = await requireRole(["emprendedor"], "/panel/productos/nuevo");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Mis productos" title="Nuevo producto" />
      <ProductForm userId={session.userId} />
    </div>
  );
}
