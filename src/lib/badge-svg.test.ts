import { describe, expect, it } from "vitest";
import { badgeSvg } from "./badge-svg";

describe("insignia SVG (HU08)", () => {
  it("muestra el nombre y el nivel", () => {
    const svg = badgeSvg("Pima Andina", 4);
    expect(svg).toContain("Pima Andina");
    expect(svg).toContain("NIVEL 4/4");
    expect(svg).toContain("Verificado");
  });
  it("escapa caracteres especiales para evitar inyección en el SVG", () => {
    const svg = badgeSvg('<script>alert("x")</script>', 1);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });
});
