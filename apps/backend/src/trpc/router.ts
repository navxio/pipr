// src/trpc/router.ts
import { initTRPC } from "@trpc/server";
import { plannerRouter } from "./routers/planner.js";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  planner: plannerRouter,
});

export type AppRouter = typeof appRouter;
