# pipr

**Project Intelligence & Planning Runtime**

pipr is an experimental, open-source planning companion for solo founders and small development teams.

<img width="1818" height="1712" alt="CleanShot 2026-01-04 at 16 43 39@2x" src="https://github.com/user-attachments/assets/e08bd806-7384-490b-955a-554259976757" />


It helps turn **current intent** into **concrete, explainable execution plans** by grounding LLM-based planning in **explicit project context and accumulated decisions**.

pipr is **not** a task tracker or project management system.  
It sits _before_ execution tools like GitHub and helps you decide **what to do next — and why**.

> For a detailed explanation of pipr’s planning model, terminology, and design rationale, see  
> **[docs/wiki.md](./docs/wiki.md)**

---

## What problem pipr solves

Early-stage projects move quickly, assumptions change often, and most planning context lives only in a developer’s head.

This leads to:

- Repeated analysis
- Vague or redundant task lists
- Loss of reasoning behind decisions
- Cognitive overload when planning the “next step”

pipr helps by:

- Reducing planning and triage cognitive load
- Turning fuzzy goals into small, actionable task proposals
- Preserving _why_ decisions were made, not just _what_ was done
- Accumulating planning context over time so you don’t have to repeat yourself

---

## Core idea

**Planning quality depends more on structured context than on clever prompting.**

pipr makes planning context explicit, persistent, and inspectable — then uses an LLM to reason _within those constraints_.

---

## What pipr deliberately does _not_ do (yet)

- Act as a full project management tool
- Track execution state or task progress
- Automatically optimize or rank proposals
- Learn preferences or adapt behavior autonomously
- Read GitHub issue state during planning

These may come later — but only if they prove necessary.

---

## Intended users

- Solo founders iterating toward product–market fit
- Small dev teams without a dedicated PM
- Developers who want better planning without heavy process

pipr is especially useful when:

- You’re context-switching frequently
- You want to avoid re-thinking the same decisions
- You care about _why_ something was planned, not just _what_

---

## Tech

- Backend: Fastify + tRPC
- Frontend: React + Vite
- Database: Postgres + Prisma
- LLMs: Local (Ollama) or hosted providers
- Context storage: Plain-text authoritative project context

---

## Status

pipr is under active development and is being used to plan its own evolution.

The planning model is intentionally minimal and extensible.

Expect breaking changes.

## Planned Features

- [ ] **Context retrieval at scale (RAG)**
  - Semantic retrieval over accumulated planning signals
  - Used only when context size exceeds what fits in a single planning frame

- [ ] **Additional planning signals**
  - Strategic intent (longer-term direction that outlives individual goals)
  - Explicit provenance signals (why a signal exists, not just what it says)

- [ ] **Completed work inference**
  - Populate `completed_work` signals from external execution systems
    (e.g. GitHub issue closure)

---

## License

Apache License 2.0

See [LICENSE](./LICENSE).
