import type { FastifyInstance } from 'fastify'
import { fromNodeHeaders, auth } from '@convio/auth'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    url: '/auth/*',
    async handler(request, reply) {
      const url = new URL(request.url, `http://${request.headers.host}`)
      const headers = fromNodeHeaders(request.headers)
      const body = request.body ? JSON.stringify(request.body) : undefined

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body,
      })

      const response = await auth.handler(req)

      reply.status(response.status)
      response.headers.forEach((value, key) => reply.header(key, value))
      return reply.send(response.body ? await response.text() : null)
    },
  })
}
