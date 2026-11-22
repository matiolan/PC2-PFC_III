import { expect, test } from "@playwright/test";

const PASS = process.env.DEMO_PASSWORD ?? "Demo2026!";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL(/\/panel/);
}

test.describe("autenticación y acceso por rol", () => {
  test("el panel exige iniciar sesión (HU02)", async ({ page }) => {
    await page.goto("/panel/negocio");
    await expect(page).toHaveURL(/\/login\?next=%2Fpanel%2Fnegocio/);
  });

  test("credenciales incorrectas muestran un mensaje genérico (HU02)", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo electrónico").fill("comprador@gamarraconecta.pe");
    await page.getByLabel("Contraseña", { exact: true }).fill("clave-incorrecta-1");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible();
  });

  test("un comprador no puede abrir el panel de verificación (HU03)", async ({ page }) => {
    await login(page, "comprador@gamarraconecta.pe");
    await page.goto("/panel/verificaciones");
    await expect(page).toHaveURL(/acceso=denegado/);
    await expect(page.getByText("Acceso restringido")).toBeVisible();
  });

  test("el gestor ve la cola de verificación y los indicadores (HU07, HU17)", async ({ page }) => {
    await login(page, "gestor@gamarraconecta.pe");
    await page.goto("/panel/verificaciones");
    await expect(page.getByRole("heading", { name: "Verificaciones" })).toBeVisible();
    await page.goto("/panel/indicadores");
    await expect(page.getByText("Negocios por nivel de formalización")).toBeVisible();
  });

  test("el emprendedor ve su ruta de formalización (HU05)", async ({ page }) => {
    await login(page, "emprendedor@gamarraconecta.pe");
    await page.goto("/panel/formalizacion");
    await expect(page.getByRole("heading", { name: "Ruta de formalización" })).toBeVisible();
  });

  test("la exportación CSV es solo para el gestor (HU19)", async ({ request }) => {
    const res = await request.get("/panel/indicadores/exportar", { maxRedirects: 0 });
    expect([302, 307, 403]).toContain(res.status());
  });
});
