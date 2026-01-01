/// apps/web/src/pages/Onboarding.tsx
import { useState } from "react";
import { trpc } from "../trpc";

export default function Onboarding({
  projectId,
  onComplete,
}: {
  projectId: string;
  onComplete: () => void;
}) {
  const [context, setContext] = useState("");
  const [nonGoals, setNonGoals] = useState("");
  const [loading, setLoading] = useState(false);

  const upsertSignal = trpc.project.upsertPlanningSignal;

  const handleSubmit = async () => {
    if (!context.trim()) return;

    setLoading(true);
    try {
      // 1️⃣ Authoritative project context
      await upsertSignal.mutate({
        projectId,
        type: "context",
        content: context.trim(),
        source: "user",
      });

      // 2️⃣ Optional non-goals (one per line)
      const lines = nonGoals
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      for (const line of lines) {
        await upsertSignal.mutate({
          projectId,
          type: "non_goal",
          content: line,
          source: "user",
        });
      }

      onComplete();
    } catch (err) {
      console.error(err);
      alert(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "48px 24px",
        display: "flex",
        justifyContent: "center",
        background: "#fafafa",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>
        <h1 style={{ marginBottom: 8 }}>Welcome to pipr</h1>
        <p style={{ marginBottom: 32, color: "#555" }}>
          Before pipr can help you plan, it needs authoritative context about
          your project.
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2>Project context</h2>
          <p style={{ fontSize: 14, color: "#666" }}>
            Describe your project as it exists today. This will be treated as
            factual planning context.
          </p>

          <textarea
            rows={10}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={`Example:

pipr is an experimental planning tool for solo developers.
It generates task proposals from goals using an LLM.
Accepted proposals are synced one-way to GitHub Issues.
Execution state is not tracked internally.`}
            style={{ width: "100%", padding: 12 }}
          />
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2>Explicit non-goals (optional)</h2>
          <p style={{ fontSize: 14, color: "#666" }}>
            List things pipr should not propose. One per line.
          </p>

          <textarea
            rows={4}
            value={nonGoals}
            onChange={(e) => setNonGoals(e.target.value)}
            placeholder={`Examples:
No mobile app
No optimization yet
No automation or learning behavior`}
            style={{ width: "100%", padding: 12 }}
          />
        </section>

        <button onClick={handleSubmit} disabled={!context.trim() || loading}>
          {loading ? "Saving…" : "Start planning"}
        </button>
      </div>
    </div>
  );
}
