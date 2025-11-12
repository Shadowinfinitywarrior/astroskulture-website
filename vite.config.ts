import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-backend-env',
      apply: 'build',
      closeBundle() {
        const source = path.resolve(__dirname, 'backend', '.env');
        const destDir = path.resolve(__dirname, 'dist');
        const dest = path.join(destDir, '.env');

        if (!existsSync(source)) {
          console.warn('backend/.env not found, skipping copy');
          return;
        }

        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }

        copyFileSync(source, dest);
        console.log('Copied backend/.env to dist');
      },
    },
  ],
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env': {}, // Define process.env for compatibility
  },
});