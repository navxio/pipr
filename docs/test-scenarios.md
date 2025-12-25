#Scenario 1 — Avoid Bootstrap / Already-Implemented Tasks

## Goal

Use pipr to plan a small improvement to the planning workflow.

## Context

• pipr already supports goal-to-task planning via an LLM
• Task proposal UI already exists
• Accepted proposals are already synced one-way to GitHub Issues
• Bootstrap and setup work is complete

## Expected Behavior

### SHOULD NOT propose

• Setting up LLMs (Ollama, hosted providers)
• Implementing goal decomposition
• Creating proposal UI
• “Initial setup” tasks

### SHOULD propose

• Small workflow improvements
• Verification or validation steps
• Minor UX or prompt-level refinements

### Result

Partial pass. Bootstrap tasks eliminated. Planner still defaults to documentation and refactor proposals when goal is underspecified.

# Scenario 2 — Documentation Is Not a Default Fix

## Goal

Use pipr to plan a small improvement that increases planning relevance.

## Context

• README is already up to date and authoritative
• Current capabilities are clearly documented
• Documentation updates are not desired unless explicitly requested

## Expected Behavior

### SHOULD NOT propose

• Updating README
• Adding documentation
• Writing “explain how it works” content

### SHOULD propose

• Behavioral improvements
• Diagnostics or validation tasks
• Prompt or context structure changes

### Result

Fail. Documentation-related proposals still appear despite explicit negative constraints; behavioral improvements are present but not consistently prioritized.

# Scenario 3 — Respect Explicit Non-Goals

## Goal

Use pipr to plan an incremental improvement.

## Context

Explicit non-goals:
• No GitHub issue state syncing during planning
• No automation or learning from history yet
• No filtering or weighting of LLM outputs

## Expected Behavior

### SHOULD NOT propose

• Reading GitHub issue state
• Learning from past goals or rejections
• Filtering, scoring, or weighting proposals

### SHOULD propose

• Manual analysis steps
• Explicit constraint additions
• Small clarifications to planning input

### Result

Fail. Despite explicit non-goals, the planner continues to propose documentation and filtering tasks, indicating weak adherence to negative constraints and a bias toward meta-improvements over concrete incremental changes

# Scenario 4 — Prefer Understanding Over Optimization

## Goal

Use pipr to reduce repeated or obvious task proposals.

## Context

• Repetition is observed but failure modes are not fully understood
• Optimization is premature
• Insight is preferred over automation

## Expected Behavior

### SHOULD NOT propose

• Refactoring proposal generation logic
• Changing LLM models
• Adding heuristics or scoring systems

### SHOULD propose

• Analysis of rejected proposals
• Identification of missing constraints
• Verification or comparison tasks

### Result

Partial pass. The planner correctly proposes analysis and failure-mode identification tasks but still suggests model training and filtering mechanisms, indicating a tendency to jump to solution design despite a stated preference for insight over optimization.

# Scenario 5 — Validate Capability Awareness

## Goal

Use pipr to verify that explicit capability context improves planning quality.

## Context

• Existing capabilities are explicitly provided in the prompt
• The planner should treat these as authoritative
• Redundant suggestions are considered failures

## Expected Behavior

### SHOULD NOT propose

• Tasks that restate existing capabilities
• “Implement X” where X already exists
• Tasks that contradict the provided context

### SHOULD propose

• New, genuinely incremental improvements
• Tests or validation steps
• UX or prompt-level refinements

### Result

Fail. The planner continues to restate existing capabilities and propose already-implemented features, showing insufficient enforcement of explicit capability context despite correctly suggesting validation-oriented tasks.
