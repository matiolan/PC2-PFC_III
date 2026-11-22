import { describe, expect, it } from "vitest";
import {
  buildQuoteMessage,
  dozenSavings,
  formalizationPercent,
  formatSoles,
  isValidPeruMobile,
  levelInfo,
  minimumSalary,
  rankByFormalization,
  slugify,
  whatsappUrl,
} from "./domain";

describe("slugify", () => {
  it("quita tildes, eñes y símbolos", () => {
    expect(slugify("Confecciones Ñusta & Cía.")).toBe("confecciones-nusta-cia");
  });
  it("no deja guiones al inicio ni al final", () => {
    expect(slugify("  --Polos Gamarra--  ")).toBe("polos-gamarra");
  });
});

describe("teléfono y WhatsApp", () => {
  it("acepta celulares peruanos de 9 dígitos que empiezan con 9", () => {
    expect(isValidPeruMobile("987654321")).toBe(true);
    expect(isValidPeruMobile("87654321")).toBe(false);
    expect(isValidPeruMobile("887654321")).toBe(false);
  });
  it("arma la URL de wa.me con el prefijo 51 y el mensaje codificado", () => {
    const url = whatsappUrl("987654321", "Hola, ¿precio x docena?");
    expect(url.startsWith("https://wa.me/51987654321?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toBe("Hola, ¿precio x docena?");
  });
  it("rechaza números inválidos", () => {
    expect(() => whatsappUrl("123", "hola")).toThrow();
  });
  it("prellena el mensaje con el producto y la cantidad", () => {
    const msg = buildQuoteMessage({ businessName: "Textiles Ana", productName: "Polo pima", quantity: 24 });
    expect(msg).toContain("Textiles Ana");
    expect(msg).toContain("24 unidades");
    expect(msg).toContain("Polo pima");
  });
  it("usa un mensaje general si no hay producto", () => {
    expect(buildQuoteMessage({ businessName: "Textiles Ana" })).toContain("al por mayor");
  });
});

describe("reglas de empleo", () => {
  it("exige al menos la RMV a tiempo completo", () => {
    expect(minimumSalary("Plazo indeterminado", 1230)).toBe(1230);
    expect(minimumSalary("Plazo fijo")).toBe(1230);
  });
  it("a tiempo parcial exige la mitad de la RMV", () => {
    expect(minimumSalary("Tiempo parcial", 1230)).toBe(615);
  });
});

describe("vitrina", () => {
  it("ordena primero por nivel y luego por fecha", () => {
    const ranked = rankByFormalization([
      { id: "a", level: 1, created_at: "2026-11-20" },
      { id: "b", level: 3, created_at: "2026-11-01" },
      { id: "c", level: 1, created_at: "2026-11-22" },
    ]);
    expect(ranked.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });
  it("calcula el ahorro por docena", () => {
    expect(dozenSavings(15, 150)).toBe(30);
    expect(dozenSavings(10, 130)).toBe(0);
  });
  it("formatea soles", () => {
    expect(formatSoles(1230)).toContain("1,230.00");
  });
});

describe("niveles de formalización", () => {
  it("acota el nivel entre 0 y 4", () => {
    expect(levelInfo(-1).level).toBe(0);
    expect(levelInfo(9).level).toBe(4);
    expect(levelInfo(2).doc).toBe("ruc");
  });
  it("convierte el nivel en porcentaje de avance", () => {
    expect(formalizationPercent(0)).toBe(0);
    expect(formalizationPercent(2)).toBe(50);
    expect(formalizationPercent(4)).toBe(100);
  });
});
