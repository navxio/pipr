import { PlanInput, PlanResponse, AcceptInput } from "@pipr/domain";
import { runPlannerLLM } from "../../agents/planner.js";

import { initTRPC } from "@trpc/server";
import type { Context } from "../context.js";

const t = initTRPC.context<Context>().create();

export const plannerRouter = t.router({
  plan: t.procedure
    .input(PlanInput)
    .output(PlanResponse)
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
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          outputJson: { tasks },
          rawOutput: rawResponse, // if you have this column
          completedAt: new Date(),
        },
      });

      return {
        agentRunId: run.id,
        tasks,
      };
    }),

  accept: t.procedure.input(AcceptInput).mutation(async ({ input, ctx }) => {
    const { prisma } = ctx;

    const projectId =
      input.projectId ??
      (await prisma.project.create({ data: { name: "Default" } })).id;

    // NOTE: this is optional long-term; fine for demo
    for (const task of input.tasks) {
      await prisma.task.create({
        data: {
          projectId,
          title: task.title,
          description: task.description,
          estimate: task.estimate,
        },
      });
    }

    return { projectId };
  }),
});
