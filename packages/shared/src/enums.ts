export enum TaskProposalStatus {
  proposed = "proposed",
  accepted = "accepted",
  rejected = "rejected",
}

// NOTE:
// `goal` and `desired_outcome` are session-scoped planning signals.
// They are inputs to planning runs but are NOT persisted as planningSignal rows.
export enum PlanningSignalType {
  context = "context",
  non_goal = "non_goal",
  accepted_work = "accepted_work",
  decision = "decision",
  goal = "goal",
  desired_outcome = "desired_outcome",
}
