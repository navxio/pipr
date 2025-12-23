import { PlanInputSchema, PlanResponseSchema } from "@pipr/shared";
import { runPlannerLLM } from "../../agents/planner.js";

import { initTRPC } from "@trpc/server";
import type { Context } from "../context.js";

const t = initTRPC.context<Context>().create();

export const plannerRouter = t.router({
  plan: t.procedure
    .input(PlanInputSchema)
    .output(PlanResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;

      // 1. Create AgentRun (thinking starts here)
      const run = await prisma.agentRun.create({
        data: {
          agentName: "planner-v1",
          inputJson: input,
        },
      });

      // 2. Run planner agent via Ollama
      const { tasks, rawResponse } = await runPlannerLLM(input.goal);

      // 3. Persist reasoning + output
      //TODO: add these to a transaction
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          outputJson: { tasks },
          rawOutput: rawResponse, // if you have this column
          completedAt: new Date(),
        },
      });

      const proposals = await Promise.all(
        tasks.map((t) =>
          prisma.taskProposal.create({
            data: {
              agentRunId: run.id,
              title: t.title,
              description: t.description,
              estimate: t.estimate,
              provenance: t.provenance,
              status: "proposed",
            },
          }),
        ),
      );

      return {
        agentRunId: run.id,
        proposals,
      };
    }),
});
