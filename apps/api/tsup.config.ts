import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: 'cjs',
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  shims: true,       // Add require() shims for packages using dynamic require()
  splitting: false,  // Single file output
  outExtension: ({ format }) => format === 'cjs' ? '.cjs' : '.js',
  // Bundle workspace packages (they are TypeScript sources that need transpilation)
  noExternal: ['@convio/ai', '@convio/config', '@convio/database', '@convio/types', '@convio/validation'],
  // Keep packages with Node.js native addons or dynamic require() external
  external: [
    'pg',
    'pg-native',
    'pgpass',
    '@prisma/client',
    '@prisma/adapter-pg',
    '@prisma/driver-adapter-utils',
  ],
})
