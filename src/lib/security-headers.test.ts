import { describe, expect, it } from "vitest";
import { buildCsp, securityHeaders } from "./security-headers";

describe("cabeceras de seguridad (PFC-14)", () => {
  it("la CSP de producción no permite eval ni ser embebida", () => {
    const csp = buildCsp(false);
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
  it("solo permite imágenes y conexiones propias y de Supabase", () => {
    const csp = buildCsp(false);
    expect(csp).toMatch(/img-src 'self' data: blob: https:\/\/\*\.supabase\.co/);
    expect(csp).not.toMatch(/img-src[^;]* https:(;| )/);
  });
  it("incluye HSTS, nosniff y X-Frame-Options", () => {
    const keys = Object.fromEntries(securityHeaders(false).map((h) => [h.key, h.value]));
    expect(keys["Strict-Transport-Security"]).toContain("max-age=63072000");
    expect(keys["X-Content-Type-Options"]).toBe("nosniff");
    expect(keys["X-Frame-Options"]).toBe("DENY");
  });
});
