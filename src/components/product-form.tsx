"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { ImagePlus, Loader2 } from "lucide-react";
import { saveProductAction } from "@/app/panel/productos/actions";
import { Alert, Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, dozenSavings, formatSoles } from "@/lib/domain";
import { PRODUCT_IMAGE_TYPES, validateProductImage, type FormState } from "@/lib/validation";
import type { Tables } from "@/lib/database.types";

const ILLUSTRATIONS = ["polo", "camiseta", "blusa", "vestido", "camisa", "casaca", "jean", "short", "buzo", "pijama", "conjunto", "uniforme", "tela", "toalla", "sabana", "gorra"];

/** HU09: formulario de producto con precio por unidad, por docena e imagen. */
export function ProductForm({ product, userId }: { product?: Tables<"products">; userId: string }) {
  const [state, action] = useActionState<FormState, FormData>(saveProductAction, {});
  const v = (k: keyof Tables<"products">) => state.values?.[k] ?? (product?.[k] != null ? String(product[k]) : "");
  const [image, setImage] = useState<string>(v("image_url") || "/productos/polo.svg");
  const [unit, setUnit] = useState(v("price_unit"));
  const [dozen, setDozen] = useState(v("price_dozen"));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const err = (k: string) => state.errors?.[k]?.[0];
  const saving = useMemo(() => dozenSavings(Number(unit) || 0, Number(dozen) || 0), [unit, dozen]);

  async function upload(file: File | undefined) {
    if (!file) return;
    const problem = validateProductImage(file);
    if (problem) return setUploadError(problem);
    setUploadError(null);
    setUploading(true);
    const ext = PRODUCT_IMAGE_TYPES[file.type as keyof typeof PRODUCT_IMAGE_TYPES];
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("productos").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return setUploadError("No se pudo subir la foto.");
    setImage(supabase.storage.from("productos").getPublicUrl(path).data.publicUrl);
  }

  return (
    <form action={action} noValidate>
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="image_url" value={image} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="flex flex-col gap-5 p-5 sm:p-7">
          {state.message && <Alert tone="error">{state.message}</Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre del producto" htmlFor="name" error={err("name")}>
              <Input id="name" name="name" defaultValue={v("name")} placeholder="Ej. Polo cuello redondo pima" aria-invalid={!!err("name")} />
            </Field>
            <Field label="Categoría" htmlFor="category" error={err("category")}>
              <Select id="category" name="category" defaultValue={v("category")}>
                <option value="">Elige una categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Descripción" htmlFor="description" hint="Material, tallas, colores y tiempos de entrega." error={err("description")}>
            <Textarea id="description" name="description" defaultValue={v("description")} maxLength={400} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Precio por unidad (S/)" htmlFor="price_unit" error={err("price_unit")}>
              <Input id="price_unit" name="price_unit" inputMode="decimal" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="18.00" aria-invalid={!!err("price_unit")} />
            </Field>
            <Field label="Precio por docena (S/)" htmlFor="price_dozen" error={err("price_dozen")}>
              <Input id="price_dozen" name="price_dozen" inputMode="decimal" value={dozen} onChange={(e) => setDozen(e.target.value)} placeholder="180.00" aria-invalid={!!err("price_dozen")} />
            </Field>
            <Field label="Pedido mínimo (unid.)" htmlFor="min_order" error={err("min_order")}>
              <Input id="min_order" name="min_order" inputMode="numeric" defaultValue={v("min_order") || "12"} />
            </Field>
          </div>
          {saving > 0 && (
            <p className="rounded-xl bg-mint-50 px-4 py-2.5 text-sm text-mint-700 ring-1 ring-mint-100">
              Tu cliente ahorra <strong>{formatSoles(saving)}</strong> comprando por docena.
            </p>
          )}
          <label className="flex items-center gap-3 text-sm text-ink-700">
            <input type="checkbox" name="active" defaultChecked={product ? product.active : true} className="size-4 accent-brand-600" />
            Publicar en la vitrina
          </label>
          <div className="flex justify-end border-t border-ink-100 pt-5">
            <SubmitButton size="lg">{product ? "Guardar cambios" : "Publicar producto"}</SubmitButton>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <p className="text-sm font-medium text-ink-800">Imagen</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Vista previa del producto" className="aspect-[10/9] w-full rounded-xl object-cover ring-1 ring-ink-100" />
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
            {uploading ? "Subiendo…" : "Subir foto (máx. 2 MB)"}
          </Button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} aria-label="Foto del producto" />
          {uploadError && <p className="text-xs font-medium text-red-600">{uploadError}</p>}
          <p className="text-xs text-ink-500">O elige una ilustración:</p>
          <div className="grid grid-cols-4 gap-2">
            {ILLUSTRATIONS.map((name) => {
              const src = `/productos/${name}.svg`;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setImage(src)}
                  className={clsx("overflow-hidden rounded-lg ring-2 transition", image === src ? "ring-brand-500" : "ring-transparent hover:ring-ink-200")}
                  aria-label={`Usar ilustración ${name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </form>
  );
}
