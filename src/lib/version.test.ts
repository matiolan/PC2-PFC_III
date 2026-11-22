import { describe, expect, it } from "vitest";
import { APP_VERSION, versionLabel } from "./version";

describe("versión de la aplicación", () => {
  it("sigue el formato de versionado semántico", () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("es la versión 1.0.0 publicada en el Sprint 4", () => {
    expect(APP_VERSION).toBe("1.0.0");
  });

  it("antepone la v en la etiqueta visible", () => {
    expect(versionLabel("2.3.4")).toBe("v2.3.4");
    expect(versionLabel()).toBe("v1.0.0");
  });
});
