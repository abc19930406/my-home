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
        transformIndexHtml(html) {
          // 從最終 HTML 移除所有 modulepreload link 標籤
          return html.replace(
            /<link[^>]*rel="modulepreload"[^>]*>/g,
            ''
          );
        }
      }
    ],
    build: {
      modulePreload: {
        polyfill: false,
        resolveDependencies: () => []
      }
    }
  }
});