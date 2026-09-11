import { defineConfig } from 'vite';

// `base` is read from an env var so the same build works on GitHub Pages
// (served from /<repo-name>/) and on any other static host (served from /).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
});
