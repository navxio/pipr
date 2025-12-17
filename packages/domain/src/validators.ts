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

export const PlanResponse = z.object({
  agentRunId: z.string(),
  tasks: z.array(TaskSuggestion),
});

export const AcceptInput = z.object({
  agentRunId: z.string(),
  projectId: z.string().optional(),
  tasks: z.array(TaskSuggestion),
});
