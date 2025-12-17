import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";

async function main() {
  const server = Fastify({ logger: true });

  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter, createContext },
  });

  server.get("/", async () => ({ ok: true }));

  await server.listen({ port: 4000 });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
