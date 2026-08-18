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
  _allowedDomains: string[],
  request?: FastifyRequest,
): Record<string, string> {
  const origin = request?.headers?.origin
  if (!origin) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
  }
}

export default fp(async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Widget-Host'],
    credentials: true,
  });
}, {
  name: 'cors',
  dependencies: ['config'],
});
