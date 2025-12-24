import { PlanInputSchema, AcceptProposalsInputSchema } from "@pipr/shared";
import { runPlannerLLM } from "../../agents/planner.js";

import { initTRPC } from "@trpc/server";
import type { Context } from "../context.js";

const t = initTRPC.context<Context>().create();

export const plannerRouter = t.router({
  plan: t.procedure.input(PlanInputSchema).mutation(async ({ input, ctx }) => {
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

    const normalizedProposals = proposals.map((p) => ({
      ...p,
      provenance: Array.isArray(p.provenance)
        ? p.provenance.filter((x): x is string => typeof x === "string")
        : [],
    }));

    return {
      agentRunId: run.id,
      proposals: normalizedProposals,
    };
  }),

  acceptProposals: t.procedure
    .input(AcceptProposalsInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;
      const { agentRunId, proposalIds, note } = input;

      // 1️⃣ Fetch all proposals for this AgentRun
      const allProposals = await prisma.taskProposal.findMany({
        where: { agentRunId },
      });

      if (allProposals.length === 0) {
        throw new Error("No proposals found for this agent run");
      }

      const allIds = allProposals.map((p) => p.id);

      // 2️⃣ Validate proposalIds belong to this run
      const invalidIds = proposalIds.filter((id) => !allIds.includes(id));
      if (invalidIds.length > 0) {
        throw new Error(
          `Invalid proposal IDs for this agent run: ${invalidIds.join(", ")}`,
        );
      }

      // 3️⃣ Update accepted proposals
      await prisma.taskProposal.updateMany({
        where: {
          id: { in: proposalIds },
        },
        data: {
          status: "accepted",
        },
      });

      // 4️⃣ Reject all others
      await prisma.taskProposal.updateMany({
        where: {
          agentRunId,
          id: { notIn: proposalIds },
        },
        data: {
          status: "rejected",
        },
      });

      // 5️⃣ Persist optional decision note
      if (note?.trim()) {
        await prisma.decisionNote.create({
          data: {
            agentRunId,
            note: note.trim(),
          },
        });
      }

      // 6️⃣ Return final state
      const accepted = await prisma.taskProposal.findMany({
        where: {
          agentRunId,
          status: "accepted",
        },
        orderBy: { createdAt: "asc" },
      });

      const rejected = await prisma.taskProposal.findMany({
        where: {
          agentRunId,
          status: "rejected",
        },
        orderBy: { createdAt: "asc" },
      });

      return {
        agentRunId,
        accepted,
        rejected,
      };
    }),
});
