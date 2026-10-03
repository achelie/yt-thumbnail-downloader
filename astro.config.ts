import { defineConfig } from 'astro/config';
import { SITE_URL } from './src/lib/site';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
