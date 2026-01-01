// src/trpc/router.ts
import { initTRPC } from "@trpc/server";
import { plannerRouter } from "./routers/planner.js";
import { projectRouter } from "./routers/project.js";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  planner: plannerRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
