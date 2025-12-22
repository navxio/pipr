// apps/frontend/src/pages/Planner.tsx
import { useState } from "react";
import { trpc } from "../trpc";
import type { TaskSuggestionType } from "@pipr/domain/types";

function TaskCard({
  task,
  onChange,
}: {
  task: TaskSuggestionType;
  onChange?: (t: TaskSuggestionType) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <input
        value={task.title}
        onChange={(e) => onChange?.({ ...task, title: e.target.value })}
        style={{ fontSize: 16, width: "100%", marginBottom: 6 }}
      />
      <textarea
        value={task.description ?? ""}
        onChange={(e) => onChange?.({ ...task, description: e.target.value })}
        rows={3}
        style={{ width: "100%", marginBottom: 6 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <input
          type="number"
          value={task.estimate ?? ""}
          onChange={(e) =>
            onChange?.({
              ...task,
              estimate: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="estimate (hours)"
          style={{ width: 120 }}
        />
        <div style={{ color: "#666", fontSize: 12 }}>
          {task.provenance?.map((p, i) => (
            <div key={i}>• {p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const [goal, setGoal] = useState("");
  const [tasks, setTasks] = useState<TaskSuggestionType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [agentRunId, setAgentRunId] = useState<string | null>(null);

  const handlePlan = async () => {
    setLoading(true);
    try {
      const result = await trpc.planner.plan.mutate({
        goal,
        projectId: projectId ?? undefined,
      });

      console.log("Query result", result);

      setAgentRunId(result.agentRunId);
      setTasks(
        result.tasks.map((t, i) => ({
          id: `s-${i}`,
          ...t,
        })),
      );
    } catch (err) {
      console.log("Error: ", String(err));
      alert(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!tasks || !agentRunId) return;

    setLoading(true);
    try {
      const result = await trpc.planner.accept.mutate({
        agentRunId,
        projectId: projectId ?? undefined,
        tasks,
      });

      setProjectId(result.projectId);
      alert("Tasks created for project: " + result.projectId);

      // reset UI
      setTasks(null);
      setGoal("");
      setAgentRunId(null);
    } catch (err) {
      alert(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>pipr — Planner (prototype)</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Project ID (optional)
        </label>
        <input
          value={projectId ?? ""}
          onChange={(e) => setProjectId(e.target.value || null)}
          style={{ width: 300 }}
        />
      </div>

      <textarea
        placeholder="Describe the goal (e.g., 'Launch onboarding flow with email sign-up and analytics')"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={5}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={handlePlan} disabled={!goal || loading}>
          {loading ? "Planning…" : "Plan"}
        </button>
        <button
          onClick={() =>
            setGoal(
              "Create onboarding flow\n- email signup\n- welcome email\n- analytics tracking",
            )
          }
        >
          Try sample goal
        </button>
      </div>

      {tasks && (
        <>
          <h2>Agent Suggestions</h2>
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onChange={(updated) =>
                setTasks((prev) =>
                  prev ? prev.map((x) => (x.id === t.id ? updated : x)) : null,
                )
              }
            />
          ))}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleAccept} disabled={loading}>
              {loading ? "Accepting…" : "Accept all"}
            </button>
            <button onClick={() => setTasks(null)}>Reject / Clear</button>
          </div>
        </>
      )}
    </div>
  );
}
