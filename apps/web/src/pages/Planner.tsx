// apps/web/src/pages/Planner.tsx
import { useState } from "react";
import { trpc } from "../trpc";
import { PlanningSidebar } from "../components/PlanningSidebar";
import { ProposalCard } from "../components/ProposalCard";
import type { TaskProposal } from "@pipr/shared";

/* ---------- Main Page ---------- */

type PlannerPageProps = {
  projectId: string;
};
export default function PlannerPage<PlannerPageProps>({
  projectId,
}: {
  projectId: string;
}) {
  const [goal, setGoal] = useState("");
  const [agentRunId, setAgentRunId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<TaskProposal[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [decisionNote, setDecisionNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    setLoading(true);
    try {
      const result = await trpc.planner.plan.mutate({ projectId, goal });
      setAgentRunId(result.agentRunId);
      setProposals(result.proposals);
      setSelectedIds(new Set());
    } catch (err) {
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
    <div style={{ display: "flex", height: "100vh" }}>
      <PlanningSidebar />

      <div
        style={{
          flex: 1,
          padding: 24,
          overflowY: "auto",
          maxWidth: 900,
        }}
      >
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
    </div>
  );
}
