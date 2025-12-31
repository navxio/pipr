# pipr Wiki — Concepts, Terms, and Architecture

This document captures the canonical concepts and design decisions behind pipr.
It exists to preserve intent, prevent conceptual drift, and serve as a reference
for future development.

pipr is not just an LLM-powered planner — it is a system for **stateful planning**.

---

## Core Philosophy

Planning quality depends more on **explicit state** than on clever prompting.

pipr treats planning as a reasoning process constrained by:

- What is known
- What is desired
- What is excluded
- What has already been decided

LLMs are used to reason _within_ this frame, not to invent it.

---

## Key Concepts

### Planning Signal

A **planning signal** is a unit of knowledge that influences planning.

Planning signals represent what the system _knows or believes_ about the project.
They persist beyond individual prompts and are assembled automatically when planning.

Planning signals are:

- Explicit
- Inspectable
- Persistent (depending on type)
- Human-readable
- Authoritative within their scope

They are **not embeddings, scores, or heuristics**.

---

## Planning Signal Types

### Goal

- **What it is**: The user’s current planning intent.
- **Scope**: Single planning session.
- **Persistence**: Does not persist across goals.
- **Authority**: User.
- **Purpose**: Drives task generation.

Example:

> “Prepare pipr v0.1.0 for release.”

---

### Desired Outcome

- **What it is**: Criteria that define what “done” means for the current goal.
- **Scope**: Single planning session.
- **Persistence**: Does not persist across goals.
- **Authority**: Goal.
- **Purpose**: Filters and evaluates task proposals.

Important distinction:

- Goals generate tasks.
- Desired outcomes constrain which tasks are acceptable.

---

### Context

- **What it is**: Asserted facts about the system that affect feasibility.
- **Scope**: Cross-goal.
- **Persistence**: Yes (until explicitly contradicted).
- **Authority**: Context overrides goal assumptions.
- **Purpose**: Grounds planning in reality.

Examples:

- “README is authoritative.”
- “pipr does not manage execution state.”
- “Accepted proposals sync one-way to GitHub.”

README contents are treated as **authoritative project context**.

---

### Non-goal

- **What it is**: Explicit exclusions — things planning must not propose.
- **Scope**: Session or cross-goal.
- **Persistence**: Soft-persistent (until revoked).
- **Authority**: Non-goals override context.
- **Purpose**: Prevents invalid, premature, or unwanted planning.

Examples:

- “Do not add automation.”
- “Do not change planner behavior.”

Non-goals are **negative facts**, not preferences.

---

### Accepted Work

- **What it is**: Work that has been explicitly committed to execution.
- **Scope**: Cross-goal.
- **Persistence**: Append-only.
- **Authority**: System (derived from user action).
- **Purpose**: Prevents re-proposing already-committed tasks.

Accepted work does **not** imply completion.

---

### Completed Work

- **What it is**: Work verified as completed by an execution system.
- **Scope**: Cross-goal.
- **Persistence**: Append-only.
- **Authority**: External system (e.g. GitHub).
- **Purpose**: Represents historical fact.

Not implemented in v0.1.0.

---

### Decision

- **What it is**: A reasoned judgment explaining why a proposal was accepted or rejected.
- **Scope**: Cross-goal.
- **Persistence**: Append-only.
- **Authority**: Human judgment.
- **Purpose**: Preserves reasoning for future planning.

Decisions may include optional explanatory metadata.

---

## Provenance

**Provenance explains how something came to exist.**

It is **not a planning signal** and does not represent planning state.

Provenance is used to:

- Inspect system behavior
- Debug planning quality
- Understand why proposals or inferences occurred

In v0.1.0, provenance is:

- Optional
- Non-authoritative
- Not used to influence planning behavior

### Where provenance appears

Provenance may be attached to:

- Task proposals
- Decisions
- System-inferred signals (future)

Rule of thumb:

- User-authored signals do not require provenance.
- System-derived artifacts may include provenance.

### Future use of provenance

In later versions, provenance may support:

- Explainability (“why was this suggested?”)
- Trust and auditability
- Debugging planner failures
- Attribution of retrieved context

Provenance is intentionally **de-emphasized** in v0.1.0 to prioritize usability.

---

## How pipr Plans

### Planning Frame Assembly

When a planning session starts, pipr assembles a **planning frame**:

1. Active project context
2. Persistent non-goals
3. Accepted work
4. Relevant past decisions
5. Current goal
6. Desired outcome (if provided)

This assembled context is passed to the planner.

---

### Task Proposal Generation

The LLM:

- Does not invent context
- Does not manage state
- Does not track execution
- Operates strictly within the planning frame

It proposes **task candidates**, not commands.

---

### Human-in-the-loop Control

Users:

- Accept or reject proposals
- Provide decision notes
- Control what becomes persistent state

pipr never auto-accepts tasks.

---

## What pipr Is Not

pipr deliberately does not:

- Track execution progress
- Replace GitHub or PM tools
- Optimize or rank tasks automatically
- Learn behavior without explicit design
- Hide planning state inside prompts

---

## Design Principles

1. Explicit state beats implicit prompts
2. Authority matters
3. Planning and execution are separate
4. Persistence enables compounding value
5. Human judgment is first-class
6. Optimization comes last

---

## Status

This document reflects the design as of pipr v0.1.0.

The planning signal model is intentionally minimal and extensible.
