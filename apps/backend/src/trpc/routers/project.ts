import { initTRPC } from "@trpc/server";
import { UpsertPlanningSignalSchema } from "@pipr/shared";

import type { Context } from "../context.js";
const t = initTRPC.context<Context>().create();

export const projectRouter = t.router({
  /**
   * Creates or updates a planning signal for a project.
   *
   * This is the canonical entry point for mutating planning knowledge.
   *
   * Lifecycle semantics:
   * - CONTEXT: only one active at a time (replace-on-write)
   * - NON_GOAL / DESIRED_OUTCOME: append-only, active by default
   * - ACCEPTED_WORK / COMPLETED_WORK / DECISION: system-emitted only
   *
   * This endpoint is used by:
   * - Onboarding flow
   * - Context edits from the UI
   * - Future tooling and automation
   */
  upsertPlanningSignal: t.procedure
    .input(UpsertPlanningSignalSchema)
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;
      const { projectId, type, content, source } = input;

      // Enforce lifecycle rules
      if (type === "context") {
        // Only one active context at a time
        await prisma.planningSignal.updateMany({
          where: {
            projectId,
            type: "context",
            active: true,
          },
          data: { active: false },
        });
      }

      await prisma.planningSignal.create({
        data: {
          projectId,
          type,
          content,
          source,
          active: true,
        },
      });

      return { ok: true };
    }),
});
