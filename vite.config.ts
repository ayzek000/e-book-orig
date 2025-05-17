import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Базовая конфигурация для совместимости с Vercel
    minify: 'esbuild',
    sourcemap: false,
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
});
