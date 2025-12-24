// apps/frontend/src/pages/Planner.tsx
import { useState } from "react";
import { trpc } from "../trpc";
import type { TaskProposal } from "@pipr/shared";

function ProposalCard({
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

export default function PlannerPage() {
  const [goal, setGoal] = useState("");
  const [agentRunId, setAgentRunId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<TaskProposal[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [decisionNote, setDecisionNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    setLoading(true);
    try {
      const result = await trpc.planner.plan.mutate({ goal });
      console.log("trpc proceduce result: ", result);

      setAgentRunId(result.agentRunId);
      setProposals(result.proposals);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("problem with trpc procedure: ", String(err));
      alert(String(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAcceptSelected = async () => {
    if (!agentRunId || selectedIds.size === 0) return;

    setLoading(true);
    try {
      await trpc.planner.acceptProposals.mutate({
        agentRunId,
        proposalIds: Array.from(selectedIds),
        note: decisionNote || undefined,
      });

      // reset UI
      setGoal("");
      setAgentRunId(null);
      setProposals([]);
      setSelectedIds(new Set());
      setDecisionNote("");
    } catch (err) {
      alert(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>pipr — Planner</h1>

      <textarea
        placeholder="What do you want to move forward right now?"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={5}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <div style={{ marginBottom: 16 }}>
        <button onClick={handlePlan} disabled={!goal || loading}>
          {loading ? "Planning…" : "Generate plan"}
        </button>
      </div>

      {proposals.length > 0 && (
        <>
          <h2>Task proposals</h2>

          {proposals.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              selected={selectedIds.has(p.id)}
              onToggle={() => toggleSelection(p.id)}
            />
          ))}

          <div style={{ marginTop: 12 }}>
            <textarea
              placeholder="Optional: why these?"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={2}
              style={{ width: "100%", marginBottom: 8 }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleAcceptSelected}
                disabled={loading || selectedIds.size === 0}
              >
                {loading ? "Saving…" : `Accept ${selectedIds.size} selected`}
              </button>

              <button
                onClick={() => {
                  setProposals([]);
                  setSelectedIds(new Set());
                }}
              >
                Discard plan
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
