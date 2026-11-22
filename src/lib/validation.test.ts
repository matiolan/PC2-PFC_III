import { describe, expect, it } from "vitest";
import { newPasswordSchema, safeNextPath, signInSchema, signUpSchema } from "./validation";

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
