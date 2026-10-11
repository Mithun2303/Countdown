import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Pages are static by default; only src/pages/api/* opts into server rendering.
export default defineConfig({
  adapter: vercel(),
  vite: {
    // pre-bundle up front; lazily discovered deps make the dev server re-optimize mid-import
    optimizeDeps: { include: ['heic-to'] },
  },
});
