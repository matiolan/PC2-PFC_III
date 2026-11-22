# Gamarra Conecta · PC2-PFC_III

Plataforma web para que los negocios del emporio comercial de **Gamarra** (galerías y vía pública) se formalicen paso a paso y lo conviertan en más ventas y mejor empleo. Proyecto de la **Práctica Calificada 2** del curso Proyecto Final de Carrera III (USIL), construido con Scrum en Jira y DevSecOps en GitHub Actions.

[![CI](https://github.com/matiolan/PC2-PFC_III/actions/workflows/ci.yml/badge.svg)](https://github.com/matiolan/PC2-PFC_III/actions/workflows/ci.yml)
[![Seguridad](https://github.com/matiolan/PC2-PFC_III/actions/workflows/security.yml/badge.svg)](https://github.com/matiolan/PC2-PFC_III/actions/workflows/security.yml)
[![E2E y DAST](https://github.com/matiolan/PC2-PFC_III/actions/workflows/e2e-dast.yml/badge.svg)](https://github.com/matiolan/PC2-PFC_III/actions/workflows/e2e-dast.yml)

| | |
|---|---|
| Producción | https://pc2-pfc-iii.vercel.app |
| Jira (Scrum) | [Tablero PFC](https://matiosystem.atlassian.net/jira/software/projects/PFC/boards/2/backlog) |
| Arquitectura | [Diagramas](docs/arquitectura) · [ADR 0001](docs/adr/0001-stack.md) |
| Flujo de trabajo | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Seguridad | [SECURITY.md](SECURITY.md) |

## Cuentas de demostración

Contraseña común: `Demo2026!` (datos ficticios)

| Rol | Correo | Qué probar |
|---|---|---|
| Gestor de galería | `gestor@gamarraconecta.pe` | Verificaciones, indicadores, auditoría, exportación CSV |
| Emprendedor | `emprendedor@gamarraconecta.pe` | Ruta de formalización (subir RUC), productos, ofertas y postulantes |
| Trabajador | `trabajador@gamarraconecta.pe` | Buscar empleos, postular, seguir postulaciones |
| Comprador | `comprador@gamarraconecta.pe` | Vitrina, ficha del negocio, cotización por WhatsApp |

## Funcionalidades (épicas)

| Épica | Historias | Qué incluye |
|---|---|---|
| E1 Acceso seguro y roles | HU01–HU03 | Registro con rol, login, recuperación, panel por rol, RLS |
| E2 Ruta de formalización | HU04–HU08 | Negocio en galería o vía pública, 5 niveles, evidencias privadas, verificación del gestor, insignia SVG |
| E3 Vitrina mayorista | HU09–HU13 | Productos con precio por unidad y docena, búsqueda, ficha, WhatsApp, ranking por formalización |
| E4 Bolsa de empleo formal | HU14–HU16 | Ofertas con sueldo ≥ RMV (configurable), postulación, gestión de postulantes |
| E5 Gestión e indicadores | HU17–HU19 | Dashboard, auditoría inmutable, CSV seguro |
| E6 Experiencia pública | HU20–HU21 | Landing animada con video propio, directorio de galerías |
| E7 DevSecOps | HU22–HU23 | CI/CD, SAST, SCA, secretos, E2E y DAST |

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Zod · Supabase (PostgreSQL 17 + RLS, Auth, Storage) · Vercel · Vitest · Playwright · GitHub Actions.

## Pipelines

| Workflow | Cuándo | Qué valida |
|---|---|---|
| **CI** | PR y push a `main`/`test` | ESLint · TypeScript · Vitest con umbrales de cobertura · `next build` |
| **Seguridad** | PR, push y semanal | CodeQL (SAST) · Gitleaks (secretos) · Dependency Review y npm audit (SCA) |
| **Convenciones de PR** | PR | Rama `feature/PFC-xx-...` y título con clave Jira |
| **Vercel** | Cada push | Preview por PR · Producción desde `main` |
| **E2E y DAST** | Despliegue de producción, semanal y manual | Playwright (escritorio y móvil) · OWASP ZAP baseline |

## Ramas

`main` (producción, protegida) ← PR de release ← `test` (integración del sprint) ← `feature|fix|chore|docs/PFC-xx-descripcion`.

## Desarrollo local

```bash
npm ci
cp .env.example .env.local      # URL y clave publicable de Supabase
npm run dev
npm run lint && npm run typecheck && npm test
BASE_URL=https://pc2-pfc-iii.vercel.app npm run test:e2e
```

## Estructura

```
src/
  app/(auth)/        registro, login, recuperación
  app/(public)/      vitrina, negocios, galerías, empleos
  app/panel/         panel por rol (negocio, formalización, productos, ofertas, verificaciones, indicadores, auditoría)
  components/        UI, landing animada, gráficos
  lib/               dominio, validación (Zod), seguridad, CSV, Supabase
supabase/            migraciones con RLS y datos de demostración
e2e/                 pruebas Playwright
docs/                arquitectura, ADR y evidencias
.github/workflows    CI, seguridad, convenciones, E2E y DAST
```

> Prototipo académico: la validación ante SUNAT y la municipalidad es simulada por formato.
