import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { ZodSchema, ZodError } from 'zod'
import { AppError } from './error.js'

type ValidationTarget = 'body' | 'query' | 'params'

interface ValidationOptions {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

export function validate(opts: ValidationOptions) {
  return async function (request: FastifyRequest, _reply: FastifyReply) {
    try {
      if (opts.body) request.body = opts.body.parse(request.body)
      if (opts.query) request.query = opts.query.parse(request.query)
      if (opts.params) request.params = opts.params.parse(request.params)
    } catch (err: unknown) {
      const zodErr = err as ZodError
      const details = zodErr.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', details)
    }
  }
}

export default fp(async function validationPlugin(_fastify: FastifyInstance) {
  // Plugin just registers AppError — decorator available via import
}, { name: 'validation' })
