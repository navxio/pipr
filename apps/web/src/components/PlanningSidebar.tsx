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

export function PlanningSidebar() {
  const { data, isLoading } = trpc.project.getPlanningSignals.useQuery();

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

      {isLoading && <div style={{ fontSize: 12 }}>Loading…</div>}

      {!isLoading && data && (
        <>
          <SignalSection
            title="Context"
            signals={data.filter((s) => s.type === "context")}
          />

          <SignalSection
            title="Non-goals"
            signals={data.filter((s) => s.type === "non_goal")}
          />

          <SignalSection
            title="Accepted work"
            signals={data.filter((s) => s.type === "accepted_work")}
          />

          <SignalSection
            title="Decisions"
            signals={data.filter((s) => s.type === "decision")}
          />
        </>
      )}
    </div>
  );
}
