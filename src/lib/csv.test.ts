import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";

describe("exportación CSV (HU19)", () => {
  it("escapa comillas y comas", () => {
    expect(csvCell('Polo "pima", 30/1')).toBe('"Polo ""pima"", 30/1"');
  });
  it("neutraliza fórmulas maliciosas", () => {
    expect(csvCell("=HYPERLINK(\"http://x\")")).toBe("\"'=HYPERLINK(\"\"http://x\"\")\"");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });
  it("conserva números negativos", () => {
    expect(csvCell(-12.5)).toBe("-12.5");
  });
  it("incluye BOM para que Excel lea las tildes", () => {
    const csv = toCsv([["Galería", "Negocios"], ["Aguja Fina", 2]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("Aguja Fina,2\r\n");
  });
});
