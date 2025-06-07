import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'build',
  },
  server: {
    proxy: {
      '/current-track': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
