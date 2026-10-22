import { defineConfig } from 'vite';
import { resolve, relative } from 'node:path';
import { profile } from './src/content.js';
import { escapeHtml, renderPortfolio, pages } from './src/render.js';

export default defineConfig({
  base: './',
  build: {
    rolldownOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([page, item]) => [page, resolve(import.meta.dirname, item.path, 'index.html')])),
    },
  },
  plugins: [{
    name: 'portfolio-static-content',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const directory = relative(import.meta.dirname, context.filename).replaceAll('\\', '/').split('/')[0];
        const page = Object.keys(pages).find(key => pages[key].path === `${directory}/`) ?? 'home';
        const title = page === 'home' ? `${profile.name} — ${profile.role}` : `${pages[page].label} | ${profile.name}`;
        return {
          html: html.replace('<!--portfolio-->', renderPortfolio(profile, page)),
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
