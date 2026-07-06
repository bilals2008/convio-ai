import { betterAuth } from 'better-auth'
import { organization, twoFactor } from 'better-auth/plugins'
import { prisma } from '@convio/database'

export const auth = betterAuth({
  database: prisma,
  emailAndPassword: {
    enabled: true,
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
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
})

export type Session = typeof auth.$Infer.Session
