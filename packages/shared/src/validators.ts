// for zod schemas
import { z } from "zod";

export const PlanInput = z.object({
  projectId: z.string().optional(),
  goal: z.string().min(5),
});

export const TaskSuggestion = z.object({
  title: z.string(),
  description: z.string().optional(),
  estimate: z.number().optional(),
  provenance: z.array(z.string()).optional(),
});

export const TaskProposal = z.object({
  id: z.string(),
  agentRunId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  estimate: z.number().optional(),
  provenance: z.array(z.string()),
  status: z.enum(["proposed", "accepted", "rejected"]),
  externalRef: z.string().optional(),
  createdAt: z.string(), // ISO date from Prisma
});

export const PlanResponse = z.object({
  agentRunId: z.string(),
  proposals: z.array(TaskProposal),
});

export const AcceptInput = z.object({
  agentRunId: z.string(),
  proposalIds: z.array(z.string()),
  projectId: z.string().optional(),
  note: z.string().optional(), // decision context
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

export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;
