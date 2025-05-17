import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Улучшение производительности сборки
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Разделение кода для лучшей загрузки
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          editor: [
            '@tiptap/react', 
            '@tiptap/starter-kit', 
            '@tiptap/extension-color',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline'
          ],
          pdf: ['pdfmake', 'jspdf', 'html-to-pdfmake', 'pdfjs-dist'],
        },
      },
    },
    // Включение source maps для отладки в production
    sourcemap: false,
  },
  // Оптимизация для мобильных устройств
  server: {
    host: true,
    port: 5173,
  },
});
