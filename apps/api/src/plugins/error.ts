import fp from 'fastify-plugin';
import type { FastifyError, FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default fp(async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ err: error }, 'Request error');

    if (error.validation) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.validation.map((err) => ({
          field: err.instancePath ? err.instancePath.slice(1).replace(/\//g, '.') : 'unknown',
          message: err.message,
        })),
      });
    }

    const statusCode = error.statusCode ?? 500;
    const message = statusCode >= 500 && fastify.config.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : error.message;

    return reply.code(statusCode).send({
      statusCode,
      error: error.code ?? 'INTERNAL_ERROR',
      message,
    });
  });
}, {
  name: 'error-handler',
  dependencies: ['config'],
});
