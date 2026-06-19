// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'remove-modulepreload',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            return html.replace(/<link[^>]*rel="modulepreload"[^>]*>\s*/g, '');
          }
        }
      }
    ],
    optimizeDeps: {
      exclude: ['@supabase/supabase-js']
    },
    build: {
      modulePreload: {
        polyfill: false,
        resolveDependencies: () => []
      }
    }
  }
});