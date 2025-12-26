# Planning Frame: Signals, State, and Context Assembly in pipr

This document captures the observed invariants, failure modes, and design principles of pipr’s planner based on empirical usage across multiple planning runs.

It is intended to guide future prompt design, UX decisions, and system architecture — **not** to prescribe immediate implementation changes.

---

## Purpose

pipr’s planning quality improved dramatically once goals were expressed with explicit structure (goal, context, non-goals, desired outcome). This document explains _why_, and formalizes the planning signals involved so they can eventually be tracked and assembled by the system rather than repeatedly supplied by the user.

---

## Key Insight

**Planner quality is dominated by input structure, not output control.**

Most perceived planner failures were caused by missing or implicit constraints, not poor reasoning. When planning inputs were under-specified, the planner filled gaps using generic software priors (documentation, refactors, setup tasks). When constraints were explicit, proposals became relevant, ordered, and appropriately scoped.

---

## Planning Signals

pipr planning operates over multiple orthogonal signals. These signals are currently provided implicitly or manually; future versions should treat them as first-class state.

### 1. Goal

- **Definition:** What the user wants to move forward _right now_
- **Source:** User
- **Persistence:** Ephemeral (per planning run)
- **Notes:** A goal alone is insufficient for high-quality planning

---

### 2. Context

- **Definition:** Facts about the project that are already true
- **Examples:**
  - Existing capabilities
  - Architecture decisions
  - Completed integrations
- **Source:** System + user
- **Persistence:** Partially persistent
- **Notes:** Context must be assembled, not retyped

---

### 3. Non-goals (Constraints)

- **Definition:** Explicit boundaries on what must _not_ be explored
- **Examples:**
  - “Do not optimize yet”
  - “Do not change planner generation logic”
- **Source:** User + decision notes
- **Persistence:** Persistent until changed
- **Notes:** Non-goals constrain the planner’s search space and must not be treated as rejections

---

### 4. Desired Outcome

- **Definition:** How success of the planning run is evaluated
- **Examples:**
  - Produce an internal document
  - Gain insight, not implementation
- **Source:** User
- **Persistence:** Per planning run
- **Notes:** Often implicit; when explicit, planning quality improves significantly

---

### 5. Provenance (Reasoning Evidence)

- **Definition:** Evidence of _why_ a proposal exists
- **Examples:**
  - “LLM analysis”
  - “Human feedback”
  - “Existing outputs reviewed”
- **Source:** Planner + user
- **Persistence:** Persistent
- **Notes:** Provenance is not just explanation — it is **evidence of completed reasoning**

---

### 6. Completed Work

- **Definition:** Work or reasoning that has already been performed
- **Source:** Derived (accepted proposals + provenance + decision notes)
- **Persistence:** Persistent
- **Notes:**
  - Not a task lifecycle state
  - Not rejection or deferral
  - Repeating completed reasoning creates _perceived redundancy_, not planner failure

---

## Task Lifecycle vs Planning State

These are **distinct concepts** and must not be conflated.

### Task lifecycle states (current)

- proposed
- accepted
- rejected

These describe **execution decisions**.

### Planning states (conceptual)

- constraints (non-goals)
- completed reasoning
- evaluation intent
- context invariants

These describe **how planning should occur**.

Adding new task states (e.g. “deferred”) prematurely would collapse important distinctions.

---

## Observed Planner Invariants

From empirical analysis:

- Relevant proposals tend to appear **early** in the list
- Task ordering reflects implicit dependency and priority
- Task cardinality adapts naturally to goal specificity
- Overgeneration concerns were largely driven by prompt constraints, not planner behavior

---

## Observed Failure Modes

Most failures stem from missing planning signals:

| Failure                       | Root Cause                       |
| ----------------------------- | -------------------------------- |
| Redundant analysis tasks      | Missing “completed work” context |
| Documentation-heavy proposals | Missing non-goals                |
| Over-broad improvements       | Underspecified desired outcome   |
| Repeated setup tasks          | Missing persistent context       |

---

## Prompt Design Principles (Derived)

Effective planning inputs exhibit:

1. Explicit context
2. Explicit non-goals
3. Clear evaluation intent
4. Separation of thinking vs execution

pipr should eventually **reduce the need for users to manually provide these signals**.

---

## Planning Frame Assembly (Conceptual)

A future pipr planning run should assemble its input frame from:

- The current goal (ephemeral)
- Persistent context (capabilities, decisions)
- Active constraints (non-goals)
- Completed reasoning (from provenance)
- Evaluation intent (when provided)

This transforms planning from a stateless prompt into a **stateful reasoning process**.

---

## Open Questions

- Which provenance entries should automatically promote to planning context?
- How should users edit or override persistent constraints?
- How should completed reasoning decay or be invalidated over time?
- How should planning frames be visualized without overwhelming the user?

---

## Non-goals (Current)

This document does **not** propose:

- Changes to planner generation logic
- Filtering, ranking, or heuristics
- New task lifecycle states
- Premature optimization

---

## Conclusion

pipr’s value lies not in generating tasks, but in **accumulating and reusing human + LLM reasoning over time**. Planning improves when the system remembers what humans should not have to repeat.

This document captures the conceptual foundation required to make that explicit.
