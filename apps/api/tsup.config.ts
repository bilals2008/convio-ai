import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: 'esm',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  noExternal: ['@convio/ai', '@convio/config', '@convio/database', '@convio/types', '@convio/validation'],
})
