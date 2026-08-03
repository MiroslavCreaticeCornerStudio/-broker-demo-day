// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// `site` drives canonical URLs, Open Graph URLs and the sitemap.
// Update to the real production domain before launch.
// The site is static apart from the on-demand `/api/lead` endpoint,
// which runs as a Vercel serverless function.
export default defineConfig({
  site: process.env.SITE_URL || 'https://broker.home2u.bg',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you'),
    }),
  ],
});
