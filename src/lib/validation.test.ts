import { describe, expect, it } from "vitest";
import {
  businessSchema,
  evidenceSchema,
  reviewSchema,
  productSchema,
  validateProductImage,
  validateEvidenceFile,
  fieldErrors,
  formValues,
  newPasswordSchema,
  safeNextPath,
  signInSchema,
  signUpSchema,
} from "./validation";

describe("registro (HU01)", () => {
  const ok = { fullName: "Rosa Quispe", email: "  ROSA@Correo.pe ", password: "Gamarra2026", role: "emprendedor" };
  it("normaliza el correo y acepta datos válidos", () => {
    const r = signUpSchema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("rosa@correo.pe");
  });
  it("no permite registrarse como gestor", () => {
    expect(signUpSchema.safeParse({ ...ok, role: "gestor" }).success).toBe(false);
  });
  it("exige contraseñas con letras y números", () => {
    expect(signUpSchema.safeParse({ ...ok, password: "soloLetras" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...ok, password: "12345678" }).success).toBe(false);
  });
});

describe("inicio de sesión y recuperación (HU02)", () => {
  it("rechaza correos inválidos", () => {
    expect(signInSchema.safeParse({ email: "no-es-correo", password: "x" }).success).toBe(false);
  });
  it("exige que las contraseñas coincidan", () => {
    const r = newPasswordSchema.safeParse({ password: "Nueva2026", confirm: "Otra2026" });
    expect(r.success).toBe(false);
  });
  it("solo redirige a rutas internas", () => {
    expect(safeNextPath("/panel/negocio")).toBe("/panel/negocio");
    expect(safeNextPath("https://malicioso.com")).toBe("/panel");
    expect(safeNextPath("//malicioso.com")).toBe("/panel");
    expect(safeNextPath(undefined)).toBe("/panel");
  });
});

describe("registro del negocio (HU04)", () => {
  const base = { name: "Pima Andina", category: "Damas", description: "", whatsapp: "987 654 321" };
  it("en vía pública no exige galería ni stand, solo la zona", () => {
    const r = businessSchema.safeParse({ ...base, location_type: "via_publica", zone: "Jr. Gamarra cuadra 7", gallery_id: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.gallery_id).toBeNull();
      expect(r.data.whatsapp).toBe("987654321");
    }
  });
  it("en galería exige galería y stand", () => {
    const r = businessSchema.safeParse({ ...base, location_type: "galeria", gallery_id: "", stand: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const paths = r.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("gallery_id");
      expect(paths).toContain("stand");
    }
  });
  it("valida el formato peruano del WhatsApp", () => {
    const r = businessSchema.safeParse({ ...base, whatsapp: "12345", location_type: "via_publica", zone: "x" });
    expect(r.success).toBe(false);
  });
  it("acepta el prefijo +51", () => {
    const r = businessSchema.safeParse({ ...base, whatsapp: "+51 987654321", location_type: "via_publica", zone: "Cuadra 5" });
    expect(r.success && r.data.whatsapp).toBe("987654321");
  });
});

describe("utilidades de formularios", () => {
  it("convierte FormData en texto y omite campos internos de React", () => {
    const fd = new FormData();
    fd.set("name", "Pima");
    fd.set("$ACTION_ID_x", "1");
    fd.set("file", new Blob(["x"]));
    expect(formValues(fd)).toEqual({ name: "Pima" });
  });
  it("agrupa los errores por campo", () => {
    const r = signInSchema.safeParse({ email: "x", password: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errs = fieldErrors(r.error);
      expect(Object.keys(errs ?? {})).toEqual(expect.arrayContaining(["email", "password"]));
    }
  });
});

describe("evidencias de formalización (HU06)", () => {
  const uid = "b1000000-0000-4000-8000-000000000002";
  const file = (lvl: number, ext = "pdf") => `${uid}/${lvl}-c1000000-0000-4000-8000-0000000000aa.${ext}`;
  it("acepta un RUC válido para el nivel 2 y asigna el tipo de documento", () => {
    const r = evidenceSchema.safeParse({ level: "2", doc_number: "20123456789", file_path: file(2) });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.doc_type).toBe("ruc");
  });
  it("rechaza un RUC que no empieza con 10 o 20", () => {
    expect(evidenceSchema.safeParse({ level: 2, doc_number: "30123456789", file_path: file(2) }).success).toBe(false);
  });
  it("valida el DNI de 8 dígitos para el nivel 1", () => {
    expect(evidenceSchema.safeParse({ level: 1, doc_number: "4587123", file_path: file(1) }).success).toBe(false);
    expect(evidenceSchema.safeParse({ level: 1, doc_number: "45871236", file_path: file(1, "jpg") }).success).toBe(true);
  });
  it("rechaza rutas manipuladas", () => {
    expect(evidenceSchema.safeParse({ level: 1, doc_number: "45871236", file_path: "../otro/archivo.pdf" }).success).toBe(false);
  });
  it("solo admite PDF, JPG o PNG de hasta 5 MB", () => {
    expect(validateEvidenceFile({ type: "application/pdf", size: 1000 })).toBeNull();
    expect(validateEvidenceFile({ type: "application/zip", size: 1000 })).toMatch(/PDF/);
    expect(validateEvidenceFile({ type: "image/png", size: 6 * 1024 * 1024 })).toMatch(/5 MB/);
    expect(validateEvidenceFile({ type: "image/png", size: 0 })).toMatch(/vacío/);
  });
});

describe("verificación del gestor (HU07)", () => {
  const id = "c1000000-0000-4000-8000-000000000001";
  it("aprueba sin nota", () => {
    expect(reviewSchema.safeParse({ id, decision: "aprobada" }).success).toBe(true);
  });
  it("observar exige un motivo", () => {
    expect(reviewSchema.safeParse({ id, decision: "observada", note: "" }).success).toBe(false);
    expect(reviewSchema.safeParse({ id, decision: "observada", note: "El RUC no es legible" }).success).toBe(true);
  });
  it("rechaza identificadores inválidos", () => {
    expect(reviewSchema.safeParse({ id: "1 or 1=1", decision: "aprobada" }).success).toBe(false);
  });
});

describe("productos por mayor (HU09)", () => {
  const ok = { name: "Polo pima", category: "Damas", price_unit: "18", price_dozen: "180", min_order: "12", active: "on" };
  it("acepta precios válidos y convierte a número", () => {
    const r = productSchema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.price_unit).toBe(18);
      expect(r.data.active).toBe(true);
    }
  });
  it("la docena no puede costar más que 12 unidades", () => {
    expect(productSchema.safeParse({ ...ok, price_dozen: "250" }).success).toBe(false);
  });
  it("rechaza precios cero o negativos", () => {
    expect(productSchema.safeParse({ ...ok, price_unit: "0" }).success).toBe(false);
    expect(productSchema.safeParse({ ...ok, price_unit: "-5" }).success).toBe(false);
  });
  it("solo admite imágenes propias de la plataforma", () => {
    expect(productSchema.safeParse({ ...ok, image_url: "/productos/polo.svg" }).success).toBe(true);
    expect(productSchema.safeParse({ ...ok, image_url: "https://malicioso.com/x.png" }).success).toBe(false);
    expect(productSchema.safeParse({ ...ok, image_url: "javascript:alert(1)" }).success).toBe(false);
  });
  it("valida la foto del producto", () => {
    expect(validateProductImage({ type: "image/webp", size: 1000 })).toBeNull();
    expect(validateProductImage({ type: "image/gif", size: 1000 })).not.toBeNull();
    expect(validateProductImage({ type: "image/png", size: 3 * 1024 * 1024 })).not.toBeNull();
  });
});
