// src/context/readProjectContext.ts
import { PrismaClient } from "../generated/prisma/client.js";
import { PlanningSignalType } from "@pipr/shared";

const SIGNAL_ORDER: PlanningSignalType[] = [
  PlanningSignalType.context,
  PlanningSignalType.non_goal,
  PlanningSignalType.accepted_work,
  PlanningSignalType.decision,
  PlanningSignalType.goal,
  PlanningSignalType.desired_outcome,
];

/**
 * Assembles the canonical planning context for a project.
 *
 * This function constructs the "planning frame" that is provided to the planner
 * LLM. It does so by collecting all active planning signals for a project and
 * rendering them into a single, structured text block.
 *
 * IMPORTANT:
 * The ordering of signals is deliberate and semantic, not chronological.
 * The planner is expected to interpret the current goal *within* existing
 * facts, constraints, and historical decisions.
 *
 * Signal order (top → bottom):
 *
 * 1. CONTEXT
 *    - Persistent, authoritative facts about the project
 *    - Treated as ground truth (e.g. "README is authoritative")
 *
 * 2. NON_GOAL
 *    - Explicit exclusions and constraints
 *    - Negative facts that bound the planner’s solution space
 *
 * 3. ACCEPTED_WORK
 *    - Work that has already been accepted and handed off to execution
 *    - Prevents redundant or already-completed proposals
 *
 * 4. DECISION
 *    - Historical judgments with rationale
 *    - Captures *why* past proposals were accepted or rejected
 *
 * 5. GOAL
 *    - The user’s current intent for this planning session
 *    - Session-scoped and interpreted within all prior signals
 *
 * 6. DESIRED_OUTCOME
 *    - What success looks like for the current goal
 *    - Used to evaluate proposal relevance, not to expand scope
 *
 * Notes:
 * - Only active signals are included.
 * - Inactive or superseded signals are intentionally excluded.
 * - This function does not perform embedding, ranking, or filtering.
 * - The output is deterministic and human-readable by design.
 *
 * The returned string is intended to be passed directly to the planner LLM
 * as authoritative planning context.
 */

export async function assembleProjectContext(
  prisma: PrismaClient,
  projectId: string,
): Promise<string> {
  const signals = await prisma.planningSignal.findMany({
    where: { projectId, active: true },
  });

  const grouped = SIGNAL_ORDER.map((type) => ({
    type,
    signals: signals.filter((s) => s.type === type),
  })).filter((group) => group.signals.length > 0);

  return grouped
    .map(
      (group) =>
        `${group.type.toUpperCase()}:\n` +
        group.signals.map((s) => `- ${s.content}`).join("\n"),
    )
    .join("\n\n");
}
