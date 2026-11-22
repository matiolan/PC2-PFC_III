import { expect, test } from "@playwright/test";

test.describe("sitio público", () => {
  test("la landing carga con el mensaje principal y los indicadores", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Formalízate paso a paso");
    await expect(page.getByRole("link", { name: /Registrar mi negocio/ }).first()).toBeVisible();
  });

  test("responde con cabeceras de seguridad", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("la vitrina busca productos y prioriza a los formalizados (HU10, HU13)", async ({ page }) => {
    await page.goto("/vitrina?q=polo");
    await expect(page.getByText(/producto\(s\) para «polo»/)).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("la ficha del negocio permite cotizar por WhatsApp (HU11, HU12)", async ({ page }) => {
    await page.goto("/negocios/pima-andina");
    await expect(page.getByRole("heading", { level: 1, name: "Pima Andina" })).toBeVisible();
    await page.getByRole("button", { name: "Cotizar por WhatsApp" }).click();
    const link = page.getByRole("link", { name: "Abrir WhatsApp" });
    await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/51987111001\?text=/);
  });

  test("la bolsa de empleo solo muestra sueldos desde la RMV (HU15)", async ({ page }) => {
    await page.goto("/empleos");
    await expect(page.getByText(/Todas las ofertas pagan al menos la RMV/)).toBeVisible();
  });

  test("una ruta inexistente muestra la página 404 sin detalles internos", async ({ page }) => {
    const res = await page.goto("/negocios/no-existe-este-negocio");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("No encontramos esta página")).toBeVisible();
  });
});
