import {
  PlanInputSchema,
  AcceptProposalsInputSchema,
  type PlanInput,
} from "@pipr/shared";
import { runPlannerLLM } from "../../agents/planner.js";

import { initTRPC } from "@trpc/server";
import type { Context } from "../context.js";
import { assembleProjectContext } from "../../helper/assembleProjectContext.js";

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
  /**
   * Initiates a new planning run and generates task proposals.
   *
   * This procedure represents the start of a planning session.
   *
   * Responsibilities:
   * - Create an AgentRun to record planning intent
   * - Assemble authoritative project planning context
   * - Invoke the planner LLM to generate task proposals
   * - Persist planner output for human review
   *
   * IMPORTANT SEMANTICS:
   *
   * - This endpoint performs NO execution side effects.
   * - No tasks are created and no external systems are modified.
   * - All generated proposals are tentative until explicitly accepted.
   *
   * Planning context is assembled from persistent planning signals
   * (context, constraints, accepted work, decisions) and treated as
   * authoritative by the planner.
   *
   * This procedure does NOT:
   * - Rank or filter proposals
   * - Learn from past runs
   * - Infer completed work
   * - Modify planning signals
   *
   * Those responsibilities are handled at acceptance time.
   */
  plan: t.procedure.input(PlanInputSchema).mutation(async ({ input, ctx }) => {
    const { prisma } = ctx;
    const { projectId, goal } = input;

    // 1️⃣ Create AgentRun (planning session)
    const run = await prisma.agentRun.create({
      data: {
        agentName: "planner-v1",
        inputJson: input,
      },
    });

    // 2️⃣ Assemble authoritative project planning context
    const projectContext = await assembleProjectContext(projectId);

    // 3️⃣ Run planner LLM
    const { tasks, rawResponse } = await runPlannerLLM(
      projectId,
      goal,
      projectContext,
    );

    // 4️⃣ Persist planner output
    // NOTE: This is intentionally not wrapped in a transaction for v0.1.0
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        outputJson: { tasks },
        rawOutput: rawResponse,
        completedAt: new Date(),
      },
    });

    // 5️⃣ Persist task proposals for human review
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
      proposals: proposals.map(normalizeTaskProposal),
    };
  }),

  /**
   * Finalizes a planning run by accepting or rejecting task proposals.
   *
   * This procedure represents the boundary between planning and execution.
   *
   * Responsibilities:
   * - Finalize the outcome of an AgentRun
   * - Persist human decisions and rationale
   * - Materialize planning signals that inform future planning runs
   * - Push accepted work to execution systems (GitHub)
   *
   * IMPORTANT SEMANTICS:
   *
   * - Accepting a proposal does NOT mean the work is completed.
   * - Acceptance represents commitment to execution.
   * - Execution state remains external (e.g. GitHub).
   *
   * Planning signals emitted here are intentionally minimal:
   *
   * - accepted_work:
   *   Records work that has already been committed to execution,
   *   preventing redundant future proposals.
   *
   * - decision:
   *   Records the reasoning behind acceptance or rejection when
   *   a decision note is provided.
   *
   * This procedure does NOT:
   * - Infer completed work
   * - Read execution state from GitHub
   * - Perform ranking or optimization
   *
   * Those concerns are deliberately deferred.
   */
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

      const allIds = new Set(allProposals.map((p) => p.id));
      const invalidIds = proposalIds.filter((id) => !allIds.has(id));

      if (invalidIds.length > 0) {
        throw new Error(
          `Invalid proposal IDs for this agent run: ${invalidIds.join(", ")}`,
        );
      }

      // 2️⃣ Accept selected proposals
      await prisma.taskProposal.updateMany({
        where: { id: { in: proposalIds } },
        data: { status: "accepted" },
      });

      // 3️⃣ Reject all remaining proposals
      await prisma.taskProposal.updateMany({
        where: {
          agentRunId,
          id: { notIn: proposalIds },
        },
        data: { status: "rejected" },
      });

      // 4️⃣ Persist optional decision note
      if (note?.trim()) {
        await prisma.decisionNote.create({
          data: {
            agentRunId,
            note: note.trim(),
          },
        });
      }

      // 5️⃣ Fetch accepted proposals (normalized for downstream use)
      const accepted = await prisma.taskProposal.findMany({
        where: {
          agentRunId,
          status: "accepted",
        },
        orderBy: { createdAt: "asc" },
      });

      const normalizedAccepted = accepted.map(normalizeTaskProposal);

      // 6️⃣ Fetch AgentRun input for execution context
      const agentRun = await prisma.agentRun.findUniqueOrThrow({
        where: { id: agentRunId },
      });

      const agentInput = agentRun.inputJson as PlanInput;

      // 7️⃣ Push accepted proposals to GitHub Issues
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
          data: { externalRef: issue.url },
        });

        // 8️⃣ Emit accepted_work planning signal
        await prisma.planningSignal.create({
          data: {
            projectId: agentInput.projectId,
            type: "accepted_work",
            content: proposal.title,
            source: "system",
            active: true,
          },
        });
      }

      // 9️⃣ Emit decision planning signal (if note exists)
      if (note?.trim()) {
        await prisma.planningSignal.create({
          data: {
            projectId: agentInput.projectId,
            type: "decision",
            content: note.trim(),
            source: "user",
            active: true,
          },
        });
      }

      return {
        agentRunId,
        accepted: normalizedAccepted,
      };
    }),
});
