import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Pages are static by default; only src/pages/api/* opts into server rendering.
export default defineConfig({
  adapter: vercel(),
});
