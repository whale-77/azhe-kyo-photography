import { defineConfig } from 'astro/config';

const isVercel = process.env.VERCEL === '1';

export default defineConfig({
  site: isVercel ? undefined : 'https://whale-77.github.io',
  base: isVercel ? '/' : '/azhe-kyo-photography',
  output: 'static',
  build: { format: 'directory' }
});

