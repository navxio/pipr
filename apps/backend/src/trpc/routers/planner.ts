import { PlanInput, PlanResponse, AcceptInput } from "@pipr/domain";

import { initTRPC } from "@trpc/server";
import type { Context } from "../context.js";

const t = initTRPC.context<Context>().create();

export const plannerRouter = t.router({
  plan: t.procedure
    .input(PlanInput)
    .output(PlanResponse)
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;

      // 1. Create AgentRun
      const run = await prisma.agentRun.create({
        data: {
          agentName: "planner-v1",
          inputJson: input,
        },
      });

      // 2. Run planner agent (stub for now)
      const tasks = [
        {
          title: "Clarify requirements",
          description: "Write a short spec and acceptance criteria",
          estimate: 2,
          provenance: ["generated locally"],
        },
        {
          title: "Implement core feature",
          estimate: 6,
          provenance: ["generated locally"],
        },
      ];

      // 3. Persist output
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          outputJson: { tasks },
          completedAt: new Date(),
        },
      });

      return { agentRunId: run.id, tasks };
    }),

  accept: t.procedure.input(AcceptInput).mutation(async ({ input, ctx }) => {
    const { prisma } = ctx;

    const projectId =
      input.projectId ??
      (await prisma.project.create({ data: { name: "Default" } })).id;

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
