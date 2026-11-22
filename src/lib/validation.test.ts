import { describe, expect, it } from "vitest";
import {
  businessSchema,
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
