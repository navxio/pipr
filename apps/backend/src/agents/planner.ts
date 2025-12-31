import fetch from "node-fetch";
import { PlannerOutputSchema } from "@pipr/shared";

const PLANNER_PROMPT = (goal: string, projectContext: string) =>
  `
You are an expert software architect and product planner.

The following information represents the authoritative planning context
for this project. Treat it as true and complete.

Project Planning Context:
"""
${projectContext}
"""

Your task:
Break the following goal into a small, concrete, actionable task list
that respects all constraints and prior decisions in the context above.

Constraints:
- 4 to 7 tasks max
- Each task must be independently actionable
- Avoid vague tasks (e.g. "refactor", "improve")
- Prefer tasks that can be completed in a single focused session
- Include a short estimate in hours (integer)
- Use simple, direct language

NOTE:
The following constraints are transitional and will eventually be derived from planning signals rather than hardcoded here.

EXISTING CAPABILITIES (DO NOT PROPOSE THESE AGAIN):

- Goal-to-task planning via LLM already exists
- Human-in-the-loop proposal acceptance UI exists
- Accepted proposals are synced one-way to GitHub Issues
- Planning history (AgentRuns, proposals, decisions) is persisted

NON-GOALS (DO NOT PROPOSE):

- Bootstrap setup tasks
- Documentation updates unless explicitly requested
- Filtering or learning mechanisms
- GitHub state syncing during planning

Do not restate or summarize the planning context.
Only propose tasks.
Return ONLY valid JSON in the following shape:

{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "estimate": number,
      "provenance": ["string"]
    }
  ]
}

Goal:
"""
${goal}
"""
`.trim();

const JSON_REPAIR_PROMPT = (raw: string) =>
  `
You previously returned an invalid response.

Your task:
Convert the content below into VALID JSON ONLY.

Rules:
- Output ONLY JSON
- No markdown
- No explanation
- No surrounding text
- Do not change the meaning
- Do not add or remove fields

Content:
"""
${raw}
"""
`.trim();

function extractJson(raw: string): string | null {
  // Try fenced ```json blocks first
  const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1];

  // Try first {...} block
  const brace = raw.match(/\{[\s\S]*\}/);
  if (brace) return brace[0];

  return null;
}

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1:8b-instruct-q4_0",
      prompt,
      stream: false,
      options: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${await res.text()}`);
  }

  const json = (await res.json()) as { response: string };
  return json.response;
}

/**
 * Executes a single planning run using an LLM.
 *
 * This function is the core planner execution primitive in pipr.
 * It takes a user goal and an already-assembled project planning context,
 * and produces a small set of actionable task proposals.
 *
 * IMPORTANT ARCHITECTURAL NOTES:
 *
 * - This function is intentionally pure:
 *   • No database access
 *   • No filesystem access
 *   • No side effects
 *
 * - All planning state (context, constraints, history) must be provided
 *   via the `projectContext` argument.
 *
 * - The LLM is expected to reason strictly within the provided context,
 *   treating it as authoritative and complete.
 *
 * Parameters:
 * - projectId:
 *   Identifier for the project being planned.
 *   Included for call-site clarity and future instrumentation.
 *
 * - goal:
 *   The current, session-scoped user intent describing what should
 *   be moved forward now.
 *
 * - projectContext:
 *   A pre-assembled, human-readable planning frame constructed from
 *   active planning signals (context, constraints, decisions, completed work).
 *
 * Behavior:
 * - Invokes the planner LLM with a strict prompt contract.
 * - Attempts to parse a valid JSON response matching PlannerOutputSchema.
 * - Performs a single JSON repair attempt if the initial output is invalid.
 *
 * Output:
 * - Returns a list of task proposals suitable for human review.
 * - Each task includes a provenance field indicating its derivation.
 *
 * Guarantees:
 * - Output is validated against PlannerOutputSchema.
 * - Returned tasks are safe to persist and present to users.
 *
 * This function does NOT:
 * - Rank, filter, or optimize proposals
 * - Learn from past runs
 * - Mutate planning signals
 *
 * Those responsibilities live elsewhere in the system.
 */
export async function runPlannerLLM(
  projectId: string,
  goal: string,
  projectContext: string,
) {
  const initialRaw = await callOllama(PLANNER_PROMPT(goal, projectContext));

  // 1️⃣ Attempt direct extraction
  const extracted = extractJson(initialRaw);
  if (extracted) {
    try {
      const parsed = PlannerOutputSchema.parse(JSON.parse(extracted));
      return {
        tasks: parsed.tasks.map((t) => ({
          ...t,
          provenance: t.provenance ?? ["derived from goal decomposition"],
        })),
        rawResponse: initialRaw,
      };
    } catch (e) {
      console.error("Could not parse returned json: ", String(e));
      // fall through to repair
    }
  }

  // 2️⃣ Single repair attempt
  const repairedRaw = await callOllama(JSON_REPAIR_PROMPT(initialRaw));

  const repairedExtracted = extractJson(repairedRaw);
  if (!repairedExtracted) {
    throw new Error("JSON repair failed:\n" + repairedRaw);
  }

  const validated = PlannerOutputSchema.parse(JSON.parse(repairedExtracted));

  return {
    tasks: validated.tasks.map((t) => ({
      ...t,
      provenance: t.provenance ?? ["derived from goal decomposition"],
    })),
    rawResponse: initialRaw,
  };
}
