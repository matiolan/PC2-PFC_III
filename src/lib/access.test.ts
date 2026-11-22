import { describe, expect, it } from "vitest";
import { canAccess, rolesFor } from "./access";
import { PANEL_NAV } from "@/components/panel-nav";
import { ROLES } from "./domain";

describe("acceso por rol (HU03)", () => {
  it("el panel de verificación es exclusivo del gestor", () => {
    expect(canAccess("gestor", "/panel/verificaciones")).toBe(true);
    for (const role of ["comprador", "emprendedor", "trabajador"] as const) {
      expect(canAccess(role, "/panel/verificaciones")).toBe(false);
      expect(canAccess(role, "/panel/verificaciones/123")).toBe(false);
    }
  });
  it("las secciones del negocio son del emprendedor", () => {
    expect(canAccess("emprendedor", "/panel/negocio")).toBe(true);
    expect(canAccess("trabajador", "/panel/productos")).toBe(false);
  });
  it("el resumen y las páginas públicas son para todos", () => {
    expect(canAccess("comprador", "/panel")).toBe(true);
    expect(canAccess("trabajador", "/vitrina")).toBe(true);
    expect(rolesFor("/panel")).toBeNull();
  });
  it("el menú de cada rol solo muestra secciones permitidas", () => {
    for (const role of ROLES) {
      for (const item of PANEL_NAV[role]) expect(canAccess(role, item.href)).toBe(true);
    }
  });
});
