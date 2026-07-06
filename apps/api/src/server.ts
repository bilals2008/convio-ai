import Fastify from 'fastify';
import configPlugin from './config/index.js';
import corsPlugin from './plugins/cors.js';
import errorHandlerPlugin from './plugins/error.js';
import authPlugin from './plugins/auth.js';

async function buildServer() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  });

  await app.register(configPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(corsPlugin);
  await app.register(authPlugin);

  app.get('/health', async () => ({ status: 'ok' }));

  app.setNotFoundHandler(async (request, reply) => {
    reply.code(404);
    return {
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    };
  });

  return app;
}

async function start() {
  const app = await buildServer();

  const { PORT, HOST } = app.config;

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  }

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
