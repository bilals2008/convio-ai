import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export class AppError extends Error {
  statusCode: number
  code: string
  details?: unknown[]

  constructor(statusCode: number, message: string, code: string = 'INTERNAL_ERROR', details?: unknown[]) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export default fp(async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: any, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ err: error }, 'Request error')

    if (error.validation) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.validation.map((err: any) => ({
          field: err.instancePath ? err.instancePath.slice(1).replace(/\//g, '.') : 'unknown',
          message: err.message,
        })),
      })
    }

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.code,
        message: error.message,
        details: error.details,
      })
    }

    const statusCode = error.statusCode ?? 500
    const message = statusCode >= 500 && fastify.config.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : error.message

    return reply.code(statusCode).send({
      statusCode,
      error: error.code ?? 'INTERNAL_ERROR',
      message,
    })
  })
}, {
  name: 'error-handler',
  dependencies: ['config'],
})
