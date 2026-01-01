import type { TaskProposal } from "@pipr/shared";
export function ProposalCard({
  proposal,
  selected,
  onToggle,
}: {
  proposal: TaskProposal;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        background: selected ? "#f6f9ff" : "#fff",
      }}
    >
      <label style={{ display: "flex", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={selected} onChange={onToggle} />

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{proposal.title}</div>

          {proposal.description && (
            <div style={{ marginTop: 4, color: "#444" }}>
              {proposal.description}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: 12,
              color: "#666",
            }}
          >
            <div>
              {proposal.provenance.map((p, i) => (
                <div key={i}>• {p}</div>
              ))}
            </div>

            {proposal.estimate != null && <div>~{proposal.estimate}h</div>}
          </div>
        </div>
      </label>
    </div>
  );
}
