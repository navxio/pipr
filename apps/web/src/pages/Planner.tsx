// apps/frontend/src/pages/Planner.tsx
import React, { useState } from "react";
import type { AgentPlanResponse, TaskSuggestion } from "@shared/types";

async function apiPlan(goal: string) {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal }),
  });
  if (!res.ok) throw new Error("plan failed: " + (await res.text()));
  return (await res.json()) as AgentPlanResponse;
}

async function apiAccept(projectId: string | null, tasks: TaskSuggestion[]) {
  const res = await fetch("/api/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, tasks }),
  });
  if (!res.ok) throw new Error("accept failed: " + (await res.text()));
  return res.json();
}

function TaskCard({
  task,
  onChange,
}: {
  task: TaskSuggestion;
  onChange?: (t: TaskSuggestion) => void;
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
        value={task.description}
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
  const [tasks, setTasks] = useState<TaskSuggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const handlePlan = async () => {
    setLoading(true);
    try {
      const json = await apiPlan(goal);
      setTasks(json.tasks.map((t, i) => ({ id: `s-${i}`, ...t })));
    } catch (err) {
      alert(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!tasks) return;
    setLoading(true);
    try {
      const res = await apiAccept(projectId, tasks);
      setProjectId(res.projectId);
      alert(
        "Created " +
          (res.created?.length ?? 0) +
          " tasks. Project: " +
          res.projectId,
      );
      setTasks(null);
      setGoal("");
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
          onClick={() => {
            setGoal(
              "Create onboarding flow\n- email signup\n- welcome email\n- analytics tracking",
            );
          }}
        >
          Try sample goal
        </button>
      </div>

      {tasks && (
        <>
          <h2>Agent Suggestions</h2>
          {tasks.map((t, idx) => (
            <TaskCard
              key={t.id ?? idx}
              task={t}
              onChange={(updated) =>
                setTasks(
                  (prev) =>
                    prev?.map((x) => (x.id === t.id ? updated : x)) ?? null,
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
