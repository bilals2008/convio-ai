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

const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource could not be found.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  422: 'The request could not be processed. Please check your input.',
  429: 'Too many requests. Please try again shortly.',
}

function friendlyMessage(statusCode: number): string {
  return STATUS_MESSAGES[statusCode] || 'An unexpected error occurred. Please try again later.'
}

export default fp(async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: any, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ err: error, path: request.url, method: request.method }, 'Request error')

    if (error.validation) {
      return reply.code(400).send({
        success: false,
        message: 'Please check your input and try again.',
        errors: error.validation.map((err: any) => ({
          field: err.instancePath ? err.instancePath.slice(1).replace(/\//g, '.') : 'unknown',
          message: err.message,
        })),
      })
    }

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        success: false,
        message: error.message,
      })
    }

    const statusCode = error.statusCode ?? 500
    const message = friendlyMessage(statusCode)

    return reply.code(statusCode).send({
      success: false,
      message,
    })
  })
}, {
  name: 'error-handler',
  dependencies: ['config'],
})
