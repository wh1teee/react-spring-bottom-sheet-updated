import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['react', 'react-dom'],
  // Keep 'use client' directive in output
  banner: {
    js: '"use client";'
  },
  // Handle CSS
  loader: {
    '.css': 'copy'
  },
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.es.js' : '.js'
    }
  },
  // Replace process.env.NODE_ENV with import.meta.env
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  // Ensure we don't break the existing output structure
  splitting: false,
  minify: false, // Let consumers minify
  treeshake: true,
})