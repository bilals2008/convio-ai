import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import type { FastifyRequest } from 'fastify';

export function getCorsHeaders(
  allowedOrigins: string,
  request?: FastifyRequest,
): Record<string, string> {
  const origins = allowedOrigins.split(',').map((o) => o.trim());
  const origin = request?.headers?.origin;

  if (origin && origins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    };
  }

  // No origin header (server-to-server) — allow
  if (!origin && origins.length > 0) {
    return {
      'Access-Control-Allow-Origin': origins[0],
      'Access-Control-Allow-Credentials': 'true',
    };
  }

  return {}
}

export default fp(async function corsPlugin(fastify: FastifyInstance) {
  const origin = fastify.config.CORS_ORIGIN;

  await fastify.register(cors, {
    origin: origin.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
}, {
  name: 'cors',
  dependencies: ['config'],
});
