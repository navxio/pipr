import fetch from "node-fetch";
import { PlannerOutputSchema } from "@pipr/shared";
import { readProjectContext } from "../context/readProjectContext.js";

const PLANNER_PROMPT = (goal: string, projectContext: string) =>
  `
Project Context:
"""
${projectContext}
"""


You are an expert software architect and product planner.

Your task:
Break the following goal into a small, concrete, actionable task list suitable for a solo developer.

Constraints:
- 4 to 7 tasks max
- Each task must be independently actionable
- Avoid vague tasks (e.g. "refactor", "improve")
- Prefer tasks that can be completed in a single focused session
- Include a short estimate in hours (integer)
- Use simple, direct language

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

export async function runPlannerLLM(goal: string) {
  const projectContext = await readProjectContext();
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
