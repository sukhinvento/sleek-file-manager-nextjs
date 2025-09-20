import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Vite is used only for Lovable's preview environment.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
  },
});