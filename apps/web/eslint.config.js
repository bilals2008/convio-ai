import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'react-refresh/only-export-components': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'no-empty': 'warn',
      'no-useless-assignment': 'warn',
      'no-useless-escape': 'warn',
    },
  },
])
