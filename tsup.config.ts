import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  target: 'es2020',
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  minify: true,
  bundle: true,
  splitting: false,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    '@radix-ui/react-portal',
    '@react-spring/web',
    '@use-gesture/react',
    '@xstate/react',
    'focus-trap',
    'xstate'
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    }
  },
  outDir: 'dist',
  tsconfig: './tsconfig.lib.json',
  // Handle CSS files
  loader: {
    '.css': 'copy',
  },
  onSuccess: async () => {
    // Copy CSS file to dist after build
    const { exec } = await import('child_process')
    exec('cp src/style.css dist/', (error) => {
      if (error) {
        console.warn('Warning: Could not copy CSS file:', error.message)
      } else {
        console.log('✅ CSS file copied to dist/')
      }
    })
  },
})