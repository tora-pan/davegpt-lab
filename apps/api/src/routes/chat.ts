import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { chatOrchestrator } from "../ai/orchestrator";
import { chatRequestSchema } from "../schemas/chat";

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", async (request, reply) => {
    const parsed = chatRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid request",
        issues: z.treeifyError(parsed.error),
      });
    }

    try {
      const response = await chatOrchestrator.chat(parsed.data);

      return reply.send(response);
    } catch (err) {
      request.log.error(err);

      return reply.status(500).send({
        error: "Failed to generate response",
      });
    }
  });

  fastify.post("/stream", async (request, reply) => {
    const parsed = chatRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid request",
        issues: z.treeifyError(parsed.error),
      });
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    reply.hijack();

    try {
      for await (const event of chatOrchestrator.chatStream(parsed.data)) {
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (err) {
      request.log.error(err);
      reply.raw.write(
        `data: ${JSON.stringify({ type: "error", error: "Failed to generate response" })}\n\n`,
      );
    } finally {
      reply.raw.end();
    }
  });
};