// apps/backend/src/rest.ts
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { runPlannerAgent } from "./workers/plannerAgent"; // use the stub you already have

export async function registerRestRoutes(
  fastify: FastifyInstance,
  prisma: PrismaClient,
) {
  fastify.post("/api/plan", async (request, reply) => {
    const body = request.body as any;
    if (!body?.goal) return reply.status(400).send({ error: "goal required" });
    const agentRun = await prisma.agentRun.create({
      data: {
        agentName: "planner-v1",
        inputJson: { goal: body.goal, projectId: body.projectId ?? null },
      },
    });
    const result = await runPlannerAgent(
      { goal: body.goal, projectId: body.projectId },
      { prisma },
    );
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { outputJson: result, completedAt: new Date() },
    });
    return reply.send(result as any);
  });

  fastify.post("/api/accept", async (request, reply) => {
    const body = request.body as any;
    if (!Array.isArray(body?.tasks))
      return reply.status(400).send({ error: "tasks required" });
    const projectId =
      body.projectId ??
      (await prisma.project.create({ data: { name: "Default" } })).id;
    const created = [];
    for (const t of body.tasks) {
      const createdTask = await prisma.task.create({
        data: {
          projectId,
          title: t.title,
          description: t.description ?? "",
          estimate: t.estimate ?? null,
          dependsOn: t.dependsOn ?? [],
        },
      });
      created.push(createdTask);
    }
    return reply.send({ projectId, created });
  });
}
