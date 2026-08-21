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

  if (!origin && origins.length > 0) {
    return {
      'Access-Control-Allow-Origin': origins[0],
      'Access-Control-Allow-Credentials': 'true',
    };
  }

  return {}
}

export function getWidgetCorsHeaders(
  allowedDomains: string[],
  request?: FastifyRequest,
): Record<string, string> {
  const origin = request?.headers?.origin
  if (!origin) return {}
  try {
    const host = new URL(origin).host.toLowerCase()
    if (allowedDomains.length > 0 && !allowedDomains.includes(host)) return {}
  } catch {
    return {}
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
  }
}

export default fp(async function corsPlugin(fastify: FastifyInstance) {
  const allowed = (fastify.config.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  await fastify.register(cors, {
    origin: allowed.length > 0 ? allowed : false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Widget-Host', 'X-Widget-Token'],
    credentials: true,
  });
}, {
  name: 'cors',
  dependencies: ['config'],
});
