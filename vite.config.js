import { defineConfig } from 'vite';
import { profile } from './src/content.js';
import { escapeHtml, renderPortfolio } from './src/render.js';

export default defineConfig({
  base: './',
  plugins: [{
    name: 'portfolio-static-content',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const title = `${profile.name} — ${profile.role}`;
        return {
          html: html.replace('<!--portfolio-->', renderPortfolio(profile)),
          tags: [
            { tag: 'title', children: escapeHtml(title) },
            { tag: 'meta', attrs: { name: 'description', content: profile.description } },
            { tag: 'meta', attrs: { property: 'og:title', content: title } },
            { tag: 'meta', attrs: { property: 'og:description', content: profile.description } },
            { tag: 'meta', attrs: { name: 'author', content: profile.name } },
          ],
        };
      },
    },
  }],
});
