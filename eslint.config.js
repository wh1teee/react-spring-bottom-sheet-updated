import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read React version from package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default tseslint.config(
  // Base ESLint recommended rules
  js.configs.recommended,
  
  // Next.js configuration via FlatCompat (first to avoid plugin conflicts)
  ...compat.extends('next/core-web-vitals'),
  
  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  
  // Prettier configuration (must be last)
  prettierConfig,
  
  // Main configuration
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
        runtime: 'automatic', // React 17+ automatic JSX runtime
      },
    },
    rules: {
      // Performance and modern practices
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      
      // React best practices
      'react/react-in-jsx-scope': 'off', // Not needed with automatic JSX runtime
      'react/jsx-uses-react': 'off', // Not needed with automatic JSX runtime
      'react/prop-types': 'off', // Using TypeScript for type checking
      'react/display-name': 'warn',
      'react/jsx-key': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-unescaped-entities': 'off',
      
      // Next.js specific
      '@next/next/no-img-element': 'warn',
      
      // Accessibility (enhanced)
      'jsx-a11y/anchor-is-valid': 'off', // Next.js Link component handles this
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      
      // TypeScript specific rules (relaxed for library code)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Relaxed for library compatibility
      '@typescript-eslint/prefer-optional-chain': 'warn', // Relaxed
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // Relaxed
      '@typescript-eslint/no-unnecessary-condition': 'off', // Often necessary in libraries
      '@typescript-eslint/no-explicit-any': 'warn', // Relaxed for library flexibility
      '@typescript-eslint/no-unsafe-assignment': 'warn', // Relaxed
      '@typescript-eslint/no-unsafe-member-access': 'warn', // Relaxed
      '@typescript-eslint/no-unsafe-call': 'warn', // Relaxed
      '@typescript-eslint/no-unsafe-return': 'warn', // Relaxed
      '@typescript-eslint/no-unsafe-argument': 'warn', // Relaxed
      '@typescript-eslint/await-thenable': 'warn', // Relaxed
      '@typescript-eslint/no-misused-promises': 'warn', // Relaxed
      '@typescript-eslint/no-empty-function': 'warn', // Relaxed for placeholder functions
      '@typescript-eslint/consistent-type-definitions': 'off', // Allow both type and interface
      '@typescript-eslint/no-redundant-type-constituents': 'warn', // Relaxed
      
      // Import organization
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      
      // Security and performance
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
    },
  },
  
  // TypeScript files specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Disable base ESLint rules that are covered by TypeScript
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-dupe-class-members': 'off',
    },
  },
  
  // JavaScript files specific configuration
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...tseslint.configs.disableTypeChecked,
  },
  
  // Configuration files
  {
    files: ['*.config.{js,mjs,cjs,ts}', '.eslintrc.{js,cjs}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  
  // Library source files (more permissive)
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'warn', // Allow console in development
      'prefer-const': 'warn', // Relaxed
      'prefer-arrow-callback': 'warn', // Relaxed for library flexibility
      '@typescript-eslint/ban-ts-comment': 'warn', // Allow @ts-ignore/@ts-expect-error in library code
      '@typescript-eslint/require-await': 'off', // Async functions without await are common in libraries
      '@typescript-eslint/no-floating-promises': 'warn', // Often intentional in library code
    },
  },
  
  // Test files (if any)
  {
    files: ['**/*.{test,spec}.{js,mjs,cjs,jsx,ts,tsx}', '**/__tests__/**/*'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/.next/',
      '**/.cache/',
      '**/coverage/',
      '**/.vercel/',
      '**/public/',
      '**/.eslintrc.js.backup',
      'pnpm-lock.yaml',
      '*.min.js',
      '**/*.d.ts',
    ],
  }
);
