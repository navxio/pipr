// packages/shared/src/types.ts
export type TaskSuggestionType = {
  id?: string; // optional local id from agent
  title: string;
  description?: string;
  estimate?: number; // hours
  dependsOn?: string[];
  provenance?: string[]; // human-readable snippets / links
};

export type AgentPlanResponse = {
  tasks: TaskSuggestionType[];
  agentRunId?: string;
};

export type AcceptTasksRequest = {
  projectId?: string | null;
  tasks: TaskSuggestionType[];
};
