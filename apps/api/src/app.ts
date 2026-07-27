import Fastify from 'fastify';
import cors from '@fastify/cors'
import { healthRoutes } from "./routes/health";
import { chatRoutes } from "./routes/chat";

export const app = Fastify({
  logger: true,
});

await app.register(healthRoutes);
await app.register(chatRoutes, {
  prefix: "/api/chat",
});

app.register(cors, {
  origin: true,
})

