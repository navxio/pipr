// apps/web/src/App.tsx
import { useEffect, useState } from "react";
import PlannerPage from "./pages/Planner";
import Onboarding from "./pages/Onboarding";
import { trpc } from "./trpc";

export default function App() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [hasContext, setHasContext] = useState<boolean | null>(null);

  useEffect(() => {
    trpc.project.bootstrap.query().then((res) => {
      setProjectId(res.projectId);
      setHasContext(res.hasContext);
    });
  }, []);

  if (!projectId || hasContext === null) {
    return null; // or spinner
  }

  if (!hasContext) {
    return (
      <Onboarding
        projectId={projectId}
        onComplete={() => setHasContext(true)}
      />
    );
  }

  return <PlannerPage projectId={projectId} />;
}
