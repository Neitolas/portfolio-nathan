import test from 'node:test';
import assert from 'node:assert/strict';
import { profile } from '../src/content.js';
import { renderPortfolio } from '../src/render.js';

test('a página já contém identidade, projetos e destinos de navegação sem JavaScript no cliente', () => {
  const html = renderPortfolio(profile);
  assert.ok(html.includes(profile.name));
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  for (const section of ['inicio', 'projetos', 'experiencia', 'sobre', 'contato']) {
    assert.ok(html.includes(`id="${section}"`), section);
  }
  for (const project of profile.projects) {
    assert.ok(html.includes(project.title));
    assert.ok(html.includes(project.url));
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(anchor), `Destino inexistente: ${anchor}`);
  }
});

test('conteúdo editorial é escapado antes de entrar no HTML', () => {
  const altered = structuredClone(profile);
  altered.name = '<script>alert("nome")</script>';
  altered.projects[0].title = '<img src=x onerror="alert(1)">';
  const html = renderPortfolio(altered);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img'));
});

test('links externos não aceitam protocolos executáveis', () => {
  const altered = structuredClone(profile);
  altered.links.github = 'javascript:alert(1)';
  assert.throws(() => renderPortfolio(altered), /URL/);
});

test('contato e evidências são links reais, sem ações vazias nem infraestrutura herdada', () => {
  const html = renderPortfolio(profile);
  assert.ok(html.includes(`mailto:${profile.email}`));
  assert.ok(!/href="(?:#|)"/.test(html));
  assert.ok(!/codedbywallace|wallacemv|websocket|placeholder|lorem ipsum/i.test(html));
  assert.ok(!html.includes('<form'));
  for (const [, attributes] of html.matchAll(/<a\s+([^>]+)>/g)) {
    if (attributes.includes('target="_blank"')) assert.ok(attributes.includes('noopener noreferrer'));
  }
});

test('a vitrine inclui os demais projetos verificados e identifica seus limites', () => {
  const html = renderPortfolio(profile);
  for (const repository of ['rag-sorveteria', 'Biblioteca_exame', 'Cart_Shop', '1986881_1999644_ADS2_turmaB_2024_player_POO', 'MiniPortif-lio', 'reactjs-fundamentos', 'docs', 'API-CONSOLE_C-']) {
    assert.ok(profile.projects.some((project) => project.url === `https://github.com/Neitolas/${repository}`), repository);
  }
  assert.equal(new Set(profile.projects.map((project) => project.id)).size, profile.projects.length);
  assert.ok(html.includes('data-filter="frontend"'));
  assert.ok(html.includes('data-filter="estudos"'));
  assert.ok(html.includes('Estrutura inicial'));
  assert.ok(html.includes('Ana Karla de Souza Moretao'));
  const rag = profile.projects.find((project) => project.id === 'rag');
  assert.ok(rag.description.includes('contexto'));
});
