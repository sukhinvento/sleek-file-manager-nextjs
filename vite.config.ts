import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { createRequire } from 'module';

// Make the lovable-tagger plugin optional so local dev doesn't fail if it's not installed
let optionalComponentTagger: any = null;
try {
  const require = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  optionalComponentTagger = require('lovable-tagger').componentTagger;
} catch (err) {
  // Silently ignore if the package is not present; it's only needed in the hosted preview environment
}

// Vite is used only for Lovable's preview environment.
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && optionalComponentTagger && optionalComponentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));