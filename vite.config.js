import { defineConfig } from 'vite';

// When using Vite, `three` comes from node_modules; the import map in index.html is only for the no-install server.
export default defineConfig({
  base: './',
  server: { port: 5173 },
  build: { target: 'es2022' },
});