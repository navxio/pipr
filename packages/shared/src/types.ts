// packages/shared/src/types.ts
export type TaskSuggestion = {
  id?: string; // optional local id from agent
  title: string;
  description?: string;
  estimate?: number; // hours
  dependsOn?: string[];
  provenance?: string[]; // human-readable snippets / links
};

export type AgentPlanResponse = {
  tasks: TaskSuggestion[];
  agentRunId?: string;
};

export type AcceptTasksRequest = {
  projectId?: string | null;
  tasks: TaskSuggestion[];
};
