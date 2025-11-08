// ESLint v9 flat config for Obsidian plugin
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';
import sdl from '@microsoft/eslint-plugin-sdl';
import importPlugin from 'eslint-plugin-import';

export default [
  // Ignore patterns (replace legacy .eslintignore)
  { ignores: ['node_modules/**', 'main.js'] },

  // Base JS + TS configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Enable typed linting for TS files (parser + project)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
  },

  // Node globals for config & scripts
  {
    files: ['eslint.config.mjs'],
    languageOptions: { globals: { process: 'readonly' } },
  },
  {
    files: ['**/*.mjs', '**/*.cjs'],
    languageOptions: { globals: { process: 'readonly' } },
  },

  // Obsidian plugin recommended rules without using "extends"
  {
    plugins: {
      obsidianmd,
      '@microsoft/sdl': sdl,
      import: importPlugin,
    },
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      ...obsidianmd.configs.recommended,
    },
  },

  // Keep only unused-vars warn; use plugin default severity for sentence-case
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    },
  },
];