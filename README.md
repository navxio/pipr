# pipr

**Project Intelligence & Planning Runtime**

pipr is an experimental, open-source project intelligence tool for solo founders and small development teams.

It helps you turn _current intent_ into _relevant, explainable execution plans_ by grounding LLM-based planning in your project’s real context (codebase, documentation, and prior decisions).

pipr is not a task tracker or PM system.  
It is a thinking and planning companion that sits _before_ execution tools like GitHub.

---

## What problem pipr solves

Early-stage projects move fast, assumptions change often, and most planning context lives only in your head.

pipr helps by:

- Reducing cognitive load around planning and triage
- Producing concrete task proposals from fuzzy goals
- Preserving _why_ decisions were made, not just _what_ was done
- Keeping planning history discoverable as the project evolves

---

## How pipr works (core loop)

1. You describe what you want to move forward _right now_ (a goal)
2. pipr plans against existing project context (e.g. README, code structure)
3. An LLM proposes a small set of actionable task **proposals**
4. You selectively accept or reject those proposals
5. Accepted proposals can be pushed to execution systems (e.g. GitHub issues)
6. Decisions and reasoning are recorded for future reference

pipr does not own execution state — tools like GitHub remain the source of truth.

---

## What exists today

- Goal-to-task planning using a local or hosted LLM
- Project-context grounding via README ingestion
- Task proposals with estimates and provenance
- Human-in-the-loop acceptance / rejection
- Persistent planning history (AgentRuns, proposals, decisions)
- Type-safe backend API (tRPC) and React UI

---

## What pipr is deliberately _not_ (yet)

- A full project management tool
- A workflow engine
- An autonomous agent system
- A replacement for GitHub, Jira, or Linear

Those may come later — if they prove necessary.

---

## Intended users

- Solo founders iterating toward product–market fit
- Small dev teams without a dedicated PM
- Developers who want better planning without heavy process

---

## Tech (current, minimal)

- Backend: Fastify + tRPC
- Frontend: React + Vite
- Database: Postgres + Prisma
- LLMs: Local (Ollama) or hosted providers
- Context: Plain-text ingestion (README for now)

---

## Status

pipr is under active development and is being used to plan its own evolution.

Expect breaking changes.

---

## License

TBD (Apache-2.0 or source-available, depending on direction)
