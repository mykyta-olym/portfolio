import { defineConfig } from 'astro/config';

// Served as a project site on GitHub Pages. SITE_BASE lets the same build run at the
// domain root (for example a user site or a custom domain) without code changes.
const base = process.env.SITE_BASE ?? '/portfolio/';

export default defineConfig({
  site: 'https://mykyta-olym.github.io',
  base,
  trailingSlash: 'always',
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: {
    format: 'directory',
    assets: 'assets',
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      assetsInlineLimit: 2048,
    },
  },
});
