import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createContext } from "./context";

const t = initTRPC.context<ReturnType<typeof createContext>>().create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(({ input }) => ({ hello: `hi ${input?.name ?? "world"}` })),
  users: t.procedure.query(async ({ ctx }) => ctx.prisma.user.findMany()),
});

export type AppRouter = typeof appRouter;
