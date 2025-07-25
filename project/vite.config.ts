import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        home: './home.html',
        'parent-dashboard': './src/parent-dashboard.tsx',
        about: './sections/about.html',
        agenda: './sections/agenda.html',
        contact: './sections/contact.html',
        news: './sections/news.html',
        policies: './sections/policies.html',
        'parent-resources': './sections/parent-resources.html',
        resources: './sections/resources.html',
        teachers: './sections/teachers.html'
      }
    }
  },
  server: {
    open: '/index.html'
  }
});