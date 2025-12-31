import {
  PlanInputSchema,
  AcceptProposalsInputSchema,
  type PlanInput,
  IngestContextSchema,
} from "@pipr/shared";
import { runPlannerLLM } from "../../agents/planner.js";

import { initTRPC } from "@trpc/server";
import type { Context } from "../context.js";

import { GitHubAdapter } from "../../adapters/github.js";
import { buildIssueBody } from "../../adapters/githubTemplates.js";

import { TaskProposalStatus } from "@pipr/shared";

const t = initTRPC.context<Context>().create();

// define the gh adapter on run so it crashes if
// env vars are invalid / missing
const github = new GitHubAdapter(
  process.env.GITHUB_TOKEN!,
  process.env.GITHUB_OWNER!,
  process.env.GITHUB_REPO!,
);

function normalizeTaskProposal(p: any) {
  return {
    ...p,
    provenance: Array.isArray(p.provenance)
      ? p.provenance.filter((x: any): x is string => typeof x === "string")
      : [],
    status: p.status as TaskProposalStatus,
  };
}

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

    const normalizedProposals = proposals.map(normalizeTaskProposal);

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

      const normalizedAccepted = accepted.map(normalizeTaskProposal);

      // start creating issues
      const agentRun = await prisma.agentRun.findUniqueOrThrow({
        where: { id: agentRunId },
      });

      const agentInput = (agentRun.inputJson as PlanInput) || null;

      if (!agentInput) {
        throw new Error("AgentRun inputJson is missing");
      }

      for (const proposal of normalizedAccepted) {
        const issue = await github.createIssue({
          title: proposal.title,
          body: buildIssueBody({
            goal: agentInput.goal,
            proposal,
            agentRunId,
            decisionNote: note,
          }),
        });

        await prisma.taskProposal.update({
          where: { id: proposal.id },
          data: {
            externalRef: issue.url,
          },
        });
      }

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

  /**
   * Ingests or updates authoritative project context.
   *
   * This endpoint creates or replaces the active CONTEXT
   * planning signal for a project.
   */
  ingestContext: t.procedure
    .input(IngestContextSchema)
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;
      const { projectId, content } = input;

      // Deactivate existing context signals
      await prisma.planningSignal.updateMany({
        where: {
          projectId,
          type: "context",
          active: true,
        },
        data: { active: false },
      });

      // Create new authoritative context
      await prisma.planningSignal.create({
        data: {
          projectId,
          type: "context",
          content,
          source: "user",
          active: true,
        },
      });

      return { ok: true };
    }),
});
