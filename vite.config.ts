import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all addresses
  },
  build: {
    outDir: 'dist', // Build to dist folder in root
    sourcemap: false, // Disable source maps in production
    emptyOutDir: true, // Clear dist folder before build
    minify: 'terser', // Minify for production
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env': {}, // Define process.env for compatibility
  },
});