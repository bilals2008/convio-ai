import fp from 'fastify-plugin';
import envSchema from 'env-schema';
import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

const schema = Type.Object({
  PORT: Type.Number({ default: 3000 }),
  HOST: Type.String({ default: '0.0.0.0' }),
  NODE_ENV: Type.Union([
    Type.Literal('development'),
    Type.Literal('production'),
    Type.Literal('test'),
  ], { default: 'development' }),
  LOG_LEVEL: Type.Union([
    Type.Literal('trace'),
    Type.Literal('debug'),
    Type.Literal('info'),
    Type.Literal('warn'),
    Type.Literal('error'),
    Type.Literal('fatal'),
  ], { default: 'info' }),
  CORS_ORIGIN: Type.String({ default: 'http://localhost:5173' }),
  KAPSO_API_BASE_URL: Type.Optional(Type.String()),
  TWILIO_ACCOUNT_SID: Type.Optional(Type.String()),
  TWILIO_AUTH_TOKEN: Type.Optional(Type.String()),
  TWILIO_NUMBER: Type.Optional(Type.String()),
  GITHUB_PAT: Type.Optional(Type.String()),
  OPENCODE_API_KEY: Type.Optional(Type.String()),
});

export type Config = Static<typeof schema>;

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}

export default fp(async function configPlugin(fastify: FastifyInstance) {
  const config = envSchema<Config>({
    schema,
    dotenv: true,
  });

  fastify.decorate('config', config);
}, {
  name: 'config',
});
