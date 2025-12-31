# pipr

**Project Intelligence & Planning Runtime**

pipr is an experimental, open-source planning companion for solo founders and small development teams.

It helps turn **current intent** into **concrete, explainable execution plans** by grounding LLM-based planning in **explicit project context and accumulated decisions**.

pipr is **not** a task tracker or project management system.  
It sits _before_ execution tools like GitHub and helps you decide **what to do next — and why**.

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

## How pipr works

### Core loop

1. You describe what you want to move forward _right now_ (a goal)
2. pipr assembles a planning frame using:
   - Authoritative project context
   - Known constraints and non-goals
   - Previously completed work
   - Recent decisions and their rationale
3. An LLM proposes a small set of actionable task **proposals**
4. You selectively accept or reject proposals
5. Accepted proposals are synced one-way to execution tools (e.g. GitHub Issues)
6. Decisions and provenance are recorded for future planning

pipr does **not** own execution state — GitHub (or similar tools) remain the source of truth for work tracking.

---

## Project context (important)

pipr relies on **explicit, authoritative project context** when planning.

In v0.1.0:

- Project context is provided directly by the user (e.g. README or architecture notes)
- This context is treated as authoritative
- It is reused automatically across planning sessions

Good context dramatically improves planning quality.

---

## What exists today (v0.1.0)

### Planning & reasoning

- Goal-to-task planning using a local or hosted LLM
- Explicit project context grounding (README or pasted context)
- Task proposals with estimates and provenance
- Human-in-the-loop acceptance and rejection
- Decision notes explaining _why_ proposals were accepted or rejected

### Persistence

- Agent runs (planning sessions)
- Task proposals
- Decisions with provenance
- Completed work inferred from accepted proposals

### Integration

- One-way sync of accepted proposals to GitHub Issues

### Developer experience

- Type-safe backend API (tRPC)
- React UI focused on planning, not execution
- Postgres + Prisma for persistent planning state

---

## What pipr deliberately does _not_ do (yet)

- Act as a full project management tool
- Track execution state or task progress
- Automatically optimize or rank proposals
- Learn preferences or adapt behavior autonomously
- Read GitHub issue state during planning

These may come later — but only if they prove necessary.

---

## Planning model (high-level)

pipr distinguishes between **tasks** and **planning signals**.

- Tasks represent _possible actions_
- Planning signals represent _knowledge and constraints_ that shape reasoning

Key planning signals in v0.1.0 include:

- Current goal (session-scoped)
- Persistent project context
- Explicit non-goals / constraints
- Already completed work
- Decisions with provenance

Planning improves as these signals accumulate.

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

---

## License

TBD (Apache-2.0 or source-available, depending on direction)
