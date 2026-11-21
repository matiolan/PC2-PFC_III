# PC2-PFC_III

Prototipo de la **Práctica Calificada 2** — Next.js + Supabase + Vercel, con gestión ágil en Jira y DevSecOps en GitHub Actions.

[![CI](https://github.com/matiolan/PC2-PFC_III/actions/workflows/ci.yml/badge.svg)](https://github.com/matiolan/PC2-PFC_III/actions/workflows/ci.yml)
[![Seguridad](https://github.com/matiolan/PC2-PFC_III/actions/workflows/security.yml/badge.svg)](https://github.com/matiolan/PC2-PFC_III/actions/workflows/security.yml)

| | |
|---|---|
| Jira | [Tablero PFC](https://matiosystem.atlassian.net/jira/software/projects/PFC/boards/2/backlog) |
| Producción | https://pc2-pfc-iii.vercel.app |
| Stack | [ADR 0001](docs/adr/0001-stack.md) |
| Flujo de trabajo | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Seguridad | [SECURITY.md](SECURITY.md) |

## Pipelines

| Workflow | Cuándo | Qué valida |
|---|---|---|
| **CI** | PR y push a `main`/`develop` | ESLint · TypeScript · Vitest + cobertura · `next build` |
| **Seguridad** | PR, push y semanal | CodeQL (SAST) · Gitleaks · Dependency Review · npm audit |
| **Convenciones de PR** | PR | Rama `feature/PFC-xx-...` y título con clave Jira |
| **Vercel** | Cada push | Preview por PR · Producción desde `main` |

## Desarrollo local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Estructura

```
src/
  app/              # rutas (App Router)
  components/       # UI
  lib/supabase/     # clientes browser / server / proxy
  proxy.ts          # refresco de sesión y protección de rutas
supabase/migrations # esquema versionado con RLS
docs/adr            # decisiones de arquitectura
.github/workflows   # CI, seguridad y convenciones
```
