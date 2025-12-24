// for zod schemas
import { z } from "zod";
import { TaskProposalStatus } from "./enums.js";

export const PlanInputSchema = z.object({
  projectId: z.string().optional(),
  goal: z.string().min(5),
});

export const TaskSuggestionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  estimate: z.number().optional(),
  provenance: z.array(z.string()).optional(),
});

export const TaskProposalSchema = z.object({
  id: z.string(),
  agentRunId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  estimate: z.number().optional(),
  provenance: z.array(z.string()),
  status: z.nativeEnum(TaskProposalStatus),
  externalRef: z.string().optional(),
  createdAt: z.date(), // ISO date from Prisma
});

export const PlanResponseSchema = z.object({
  agentRunId: z.string(),
  proposals: z.array(TaskProposalSchema),
});

export const AcceptInputSchema = z.object({
  agentRunId: z.string(),
  proposalIds: z.array(z.string()),
  projectId: z.string().optional(),
  note: z.string().optional(), // decision context
});

export const AcceptProposalsInputSchema = z.object({
  agentRunId: z.string(),
  proposalIds: z.array(z.string()).min(1),
  note: z.string().optional(),
});

export const PlannerOutputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      estimate: z.number(),
      provenance: z.array(z.string()).optional(),
    }),
  ),
});

export type TaskProposal = z.infer<typeof TaskProposalSchema>;

export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;
