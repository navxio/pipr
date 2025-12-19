# PIPR – Developer Architecture Guide

This repository is a pnpm-based monorepo with a deliberately strict architecture.
The goal is to make dependency direction, type sharing, and runtime boundaries explicit, even if that costs a bit of upfront complexity.

If you are contributing, please read this once before touching configs.

⸻

High-level overview

apps/
backend/ # Node.js ESM backend (Fastify + tRPC + Prisma)
web/ # Frontend app (Vite + React + TypeScript)

packages/
domain/ # Domain contracts (types, schemas, validators)
api/ # API surface (types-only, derived from backend)

There are two kinds of things in this repo:

Kind Meaning
Apps Deployable, runnable artifacts
Packages Importable contracts / libraries

⸻

Dependency direction (NON-NEGOTIABLE)

The entire repo is built around this one invariant:

@pipr/domain → backend → @pipr/api → web

Allowed imports
• backend → @pipr/domain
• @pipr/api → backend (types only)
• web → @pipr/domain
• web → @pipr/api

Forbidden imports (do not do this)
• web → backend
• domain → backend
• domain → api
• api → web

If you break this, TypeScript will eventually scream — and it should.

⸻

Packages explained

@pipr/domain (domain contracts)

What it is
• Pure domain contracts
• Zod schemas
• DTOs, request/response types
• No runtime code, no IO, no framework logic

What it is not
• No backend logic
• No database access
• No HTTP / tRPC / Fastify code

Build output
• Emits .d.ts only
• Consumed via packages/domain/dist/index.d.ts

Rule

Everything that consumers import must be exported from src/index.ts

⸻

@pipr/api (API surface)

What it is
• A types-only package
• Exposes the public backend API shape (e.g. AppRouter)
• The only thing frontend uses to know about backend APIs

What it is not
• No runtime code
• No HTTP logic
• No business logic

Build output
• Emits a single dist/index.d.ts
• Depends on backend types, not runtime

⸻

Apps explained

Backend (apps/backend)
• Node.js ESM (moduleResolution: NodeNext)
• Fastify + tRPC
• Prisma (ESM-first)
• Uses tsx for dev

Important backend rules
• Relative imports must use .js extensions
(this is required for real Node ESM)
• Backend can import from @pipr/domain
• Backend must not import from @pipr/api

This is intentional and future-proof.

⸻

Web (apps/web)
• Vite + React + TypeScript
• Uses bundler semantics, not Node semantics
• Consumes only:
• @pipr/domain (dist)
• @pipr/api (dist)

Build strategy (important)

"build": "vite build"
"typecheck": "tsc -p tsconfig.app.json --noEmit"

Why:
• vite build reflects what actually ships
• tsc is used as a separate analysis step
• Avoids TypeScript crawling backend source

Do not add tsc to the web build step.

⸻

TypeScript configuration philosophy

Root tsconfig.json
• Defines policy, not environment
• Contains:
• strictness
• shared paths
• Does not decide runtime module systems

"paths": {
"@pipr/domain": ["packages/domain/dist/index.d.ts"],
"@pipr/domain/_": ["packages/domain/dist/_"],
"@pipr/api": ["packages/api/dist/index.d.ts"],
"@pipr/api/_": ["packages/api/dist/_"]
}

Root paths always point to dist/, never src/.

Source access (if ever needed) must be explicitly overridden per-project.

⸻

Build commands (canonical)

From the repo root:

pnpm build:domain # builds @pipr/domain (d.ts only)
pnpm build:api # builds @pipr/api (d.ts only)
pnpm dev:backend # starts backend (tsx)
pnpm --filter pipr-web build # vite build

Or everything:

pnpm build

⸻

Common pitfalls (read this if something breaks)

❌ “Cannot find module @pipr/domain”
• Check that:
• packages/domain/dist/index.d.ts exists
• Symbols are exported from src/index.ts
• Root paths point to dist/index.d.ts
• TS server was restarted

⸻

❌ TS6307 errors in frontend

You are almost certainly:
• letting frontend see backend/domain source
• using tsc -b in a web build
• referencing packages in apps/web/tsconfig.json

Frontend must consume packages, not projects.

⸻

❌ No dist/ folder after build

Likely causes:
• incremental TS cache (tsbuildinfo)
• build skipped as “up to date”

Fix:

rm -rf packages/_/dist
rm -rf \*\*/_.tsbuildinfo
pnpm build

⸻

Publishing

Packages are currently private workspace packages.
• We do not publish just to reserve the scope
• @pipr/\* is safe as long as the npm org/user exists
• Publishing will be revisited only if cross-repo consumption is needed

⸻

Design philosophy (why this is strict)

This repo intentionally favors:
• explicit boundaries over convenience
• correctness over magic
• contracts over shared source
• real Node ESM semantics

This costs some upfront setup, but:
• prevents architectural drift
• avoids accidental coupling
• scales cleanly as the codebase grows

⸻

Final note for contributors

If something feels “unnecessarily strict”, ask why the boundary exists before relaxing it.

Most of the rules here exist because relaxing them caused subtle bugs or long-term pain in other systems.

When in doubt:
• packages expose contracts
• apps consume contracts
• runtime code stays isolated
