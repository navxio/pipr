// src/trpc/router.ts
import { initTRPC } from "@trpc/server";
// import { plannerRouter } from "./routers/planner";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({});

export type AppRouter = typeof appRouter;
