import { useEffect, useState } from "react";
import { trpc } from "../trpc";
function SignalSection({
  title,
  signals,
}: {
  title: string;
  signals: { id: string; content: string }[];
}) {
  if (signals.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          color: "#666",
          marginBottom: 4,
        }}
      >
        {title}
      </div>

      {signals.map((s) => (
        <div
          key={s.id}
          style={{
            fontSize: 13,
            padding: "6px 8px",
            marginBottom: 4,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 4,
          }}
        >
          {s.content}
        </div>
      ))}
    </div>
  );
}

type PlanningSignal = {
  id: string;
  type: string;
  content: string;
};

export function PlanningSidebar() {
  const [signals, setSignals] = useState<PlanningSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await trpc.project.getPlanningSignals.query();
        if (!cancelled) {
          setSignals(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        width: 280,
        padding: 16,
        borderRight: "1px solid #eee",
        background: "#fafafa",
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginTop: 0 }}>What pipr knows</h3>

      {loading && <div style={{ fontSize: 12 }}>Loading…</div>}
      {error && (
        <div style={{ fontSize: 12, color: "red" }}>Failed to load context</div>
      )}

      {!loading && !error && (
        <>
          <SignalSection
            title="Context"
            signals={signals.filter((s) => s.type === "context")}
          />

          <SignalSection
            title="Non-goals"
            signals={signals.filter((s) => s.type === "non_goal")}
          />

          <SignalSection
            title="Accepted work"
            signals={signals.filter((s) => s.type === "accepted_work")}
          />

          <SignalSection
            title="Decisions"
            signals={signals.filter((s) => s.type === "decision")}
          />
        </>
      )}
    </div>
  );
}
