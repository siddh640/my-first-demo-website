// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        home: "./home.html",
        "parent-dashboard": "./src/parent-dashboard.tsx",
        about: "./sections/about.html",
        agenda: "./sections/agenda.html",
        contact: "./sections/contact.html",
        news: "./sections/news.html",
        policies: "./sections/policies.html",
        "parent-resources": "./sections/parent-resources.html",
        resources: "./sections/resources.html",
        teachers: "./sections/teachers.html"
      }
    }
  },
  server: {
    open: "/index.html"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiAnLi9pbmRleC5odG1sJyxcbiAgICAgICAgaG9tZTogJy4vaG9tZS5odG1sJyxcbiAgICAgICAgJ3BhcmVudC1kYXNoYm9hcmQnOiAnLi9zcmMvcGFyZW50LWRhc2hib2FyZC50c3gnLFxuICAgICAgICBhYm91dDogJy4vc2VjdGlvbnMvYWJvdXQuaHRtbCcsXG4gICAgICAgIGFnZW5kYTogJy4vc2VjdGlvbnMvYWdlbmRhLmh0bWwnLFxuICAgICAgICBjb250YWN0OiAnLi9zZWN0aW9ucy9jb250YWN0Lmh0bWwnLFxuICAgICAgICBuZXdzOiAnLi9zZWN0aW9ucy9uZXdzLmh0bWwnLFxuICAgICAgICBwb2xpY2llczogJy4vc2VjdGlvbnMvcG9saWNpZXMuaHRtbCcsXG4gICAgICAgICdwYXJlbnQtcmVzb3VyY2VzJzogJy4vc2VjdGlvbnMvcGFyZW50LXJlc291cmNlcy5odG1sJyxcbiAgICAgICAgcmVzb3VyY2VzOiAnLi9zZWN0aW9ucy9yZXNvdXJjZXMuaHRtbCcsXG4gICAgICAgIHRlYWNoZXJzOiAnLi9zZWN0aW9ucy90ZWFjaGVycy5odG1sJ1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgb3BlbjogJy9pbmRleC5odG1sJ1xuICB9XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUVsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sb0JBQW9CO0FBQUEsUUFDcEIsT0FBTztBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1Ysb0JBQW9CO0FBQUEsUUFDcEIsV0FBVztBQUFBLFFBQ1gsVUFBVTtBQUFBLE1BQ1o7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
