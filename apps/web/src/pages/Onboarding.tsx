// apps/web/src/pages/Onboarding.tsx
import { useState } from "react";
import { trpc } from "../trpc";

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [context, setContext] = useState("");
  const [nonGoals, setNonGoals] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!context.trim()) return;

    setLoading(true);
    try {
      await trpc.project.initialize.mutate({
        context: context.trim(),
        nonGoals: nonGoals.trim() || undefined,
      });

      onComplete();
    } catch (err) {
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
          Before pipr can help you plan, it needs a clear understanding of your
          project as it exists today.
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 8 }}>Project context</h2>
          <p style={{ marginBottom: 8, color: "#666", fontSize: 14 }}>
            Describe your project’s current state. This will be treated as
            authoritative planning context.
          </p>

          <textarea
            placeholder={`Example:

pipr is an experimental planning tool for solo developers.
It generates task proposals from goals using an LLM.
Accepted proposals are synced one-way to GitHub Issues.
Execution state is not tracked inside pipr.
`}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={10}
            style={{
              width: "100%",
              padding: 12,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          />
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 8 }}>Explicit non-goals (optional)</h2>
          <p style={{ marginBottom: 8, color: "#666", fontSize: 14 }}>
            List things you explicitly do <em>not</em> want pipr to plan for.
            One per line.
          </p>

          <textarea
            placeholder={`Examples:
- No mobile app
- No optimization work yet
- No automation or learning behavior`}
            value={nonGoals}
            onChange={(e) => setNonGoals(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          />
        </section>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleSubmit} disabled={loading || !context.trim()}>
            {loading ? "Saving…" : "Start planning"}
          </button>
        </div>
      </div>
    </div>
  );
}
