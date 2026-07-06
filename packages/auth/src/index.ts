import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins/organization'
import { twoFactor } from 'better-auth/plugins/two-factor'
import { prisma } from '@convio/database'

export { fromNodeHeaders } from 'better-auth/node'

function createAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: process.env.NODE_ENV === 'production',
      minPasswordLength: 8,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      },
    },
    plugins: [
      organization(),
      twoFactor(),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    user: {
      additionalFields: {
        organizationId: {
          type: 'string',
          required: false,
        },
      },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
  })
}

let _auth: ReturnType<typeof createAuth> | null = null

export function getAuth() {
  if (!_auth) {
    _auth = createAuth()
  }
  return _auth
}

export const auth = new Proxy({} as ReturnType<typeof createAuth>, {
  get(_, prop) {
    return getAuth()[prop as keyof ReturnType<typeof createAuth>]
  },
})

export type Session = typeof auth.$Infer.Session
