// apps/web/src/App.tsx
import { useEffect, useState } from "react";
import PlannerPage from "./pages/Planner";
import Onboarding from "./pages/Onboarding";
import { trpc } from "./trpc";

export default function App() {
  const [ready, setReady] = useState(false);
  const [hasContext, setHasContext] = useState<boolean | null>(null);

  useEffect(() => {
    trpc.project.hasContext
      .query()
      .then((res) => setHasContext(res.hasContext))
      .catch(() => setHasContext(false));
  }, []);

  if (hasContext === null) {
    return null; // or loading spinner
  }

  if (!hasContext) {
    return <Onboarding onComplete={() => setHasContext(true)} />;
  }

  return <PlannerPage />;
}
