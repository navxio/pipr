# Contributing to PIPR

This repository is a pnpm monorepo with intentionally strict architectural boundaries.
Please read this document before modifying configuration, build logic, or dependencies.

## Repository Structure

```
apps/
  backend/     Node.js backend (Fastify + tRPC + Prisma, ESM)
  web/         Frontend app (Vite + React + TypeScript)
packages/
  shared/      Shared contracts (types, schemas, validators)
```

- **Apps** are runnable, deployable units
- **Packages** expose reusable contracts or libraries

## Dependency Rules (Strict)

### Allowed dependency direction

```
shared → backend → web
```

### Allowed imports

- `backend` → `@pipr/shared`
- `web` → `@pipr/shared`
- `web` → `backend` (types only)

### Forbidden imports

- `shared` → `backend`
- `shared` → `web`
- `backend` → `web`
- runtime imports from `web` → `backend`

**Violating these rules will break type safety or builds.**

## Package Responsibilities

### @pipr/shared

- Zod schemas
- DTOs / request–response types
- Schema-derived TypeScript types

#### Must not contain

- Backend logic
- Database access
- HTTP / tRPC code
- Side effects

Exports must be defined via `src/index.ts`.

### Backend (apps/backend)

- Node.js ESM (`moduleResolution: NodeNext`)
- Fastify + tRPC + Prisma
- Uses `tsx` for development

#### Rules

- Relative imports must use `.js` extensions
- May import from `@pipr/shared`
- Must not import frontend code

The backend owns the API shape (`AppRouter`).

### Frontend (apps/web)

- Vite + React + TypeScript
- Consumes:
  - `@pipr/shared`
  - backend types only

#### Build strategy

```json
{
  "build": "vite build",
  "typecheck": "tsc -p tsconfig.app.json --noEmit"
}
```

**Do not add `tsc` to the frontend build step.**

## TypeScript Configuration Rules

- Root `tsconfig.json` defines policy, not runtime
- Path aliases must point to `dist/`, never `src/`
- Project references and solution builds are intentionally avoided
- Source access must be explicitly opted into per project

## Canonical Commands

```bash
pnpm build:shared
pnpm dev:backend
pnpm --filter pipr-web build
```

Or everything:

```bash
pnpm build
```

## Common Issues

### Cannot find @pipr/shared

- Ensure `packages/shared/dist` exists
- Ensure exports are re-exported from `src/index.ts`
- Restart the TypeScript server

### TS6307 / TS6059 errors

- Frontend is likely pulling in backend or shared source
- Do not use `tsc -b`
- Do not reference projects in frontend tsconfig

### Missing build output

```bash
rm -rf packages/*/dist
rm -rf **/*.tsbuildinfo
pnpm build
```

## Publishing Policy

Packages are private workspace packages.
Publishing will only be considered if cross-repository reuse becomes necessary.

## Final Guidance

This repository favors:

- explicit boundaries over convenience
- contracts over shared source
- correctness over tooling shortcuts

If something feels overly strict, ask why before relaxing it.

### When in doubt

- packages expose contracts
- apps consume contracts
- runtime code stays isolated
