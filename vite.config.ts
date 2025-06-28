import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use SWC for faster development builds
      jsxRuntime: 'automatic',
    }),
  ],
  
  // Define aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@docs': resolve(__dirname, './docs'),
      '@pages': resolve(__dirname, './pages'),
    },
  },

  // Development server configuration  
  server: {
    port: 3000,
    host: true,
    open: true,
  },

  // Build configuration for the demo site
  build: {
    outDir: 'dist-demo',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },

  // CSS handling
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    devSourcemap: true,
  },

  // Enable experimental features
  esbuild: {
    target: 'es2020',
    jsx: 'automatic',
  },

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})