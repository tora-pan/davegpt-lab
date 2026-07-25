import Fastify from 'fastify';
import cors from '@fastify/cors'
import { healthRoutes } from "./routes/health";

export const app = Fastify({
  logger: true,
});

await app.register(healthRoutes);

app.register(cors, {
  origin: true,
})

