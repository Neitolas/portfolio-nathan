import test from 'node:test';
import assert from 'node:assert/strict';
import { profile } from '../src/content.js';
import { renderPortfolio, escapeHtml } from '../src/render.js';

const pages = ['home', 'projects', 'development', 'paint', 'about'];

test('as cinco páginas têm identidade própria, navegação real e aba atual', () => {
  for (const page of pages) {
    const html = renderPortfolio(profile, page);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
    assert.ok(html.includes(`data-page="${page}"`));
    for (const label of ['Home', 'Projetos', 'Desenvolvimento', 'Paint', 'Sobre']) assert.ok(html.includes(`>${label}</span>`));
    assert.ok(!html.includes('Infraestrutura') && !html.includes('href="../infra/"'));
    assert.ok(html.includes(profile.email));
    assert.ok(!/wallacemv|Wallace|Sem Parar|Kubernetes|Gemini|VPS Ubuntu/.test(html));
    assert.ok(!/href="(?:#|)"/.test(html));
  }
});

test('início tem retrato da foto, competências e experiências de Nathan no HTML', () => {
  const html = renderPortfolio(profile);
  assert.ok(html.includes(profile.name));
  assert.ok(html.includes(escapeHtml(profile.portrait.text)));
  assert.ok(html.includes('data-portrait aria-hidden="true"'));
  assert.ok(html.includes('aria-label="Retrato de Nathan Nogueira Carrara em caracteres ASCII"'));
  assert.ok(!html.includes('RETRATO / NATHAN'));
  for (const experience of profile.experiences) assert.ok(html.includes(experience.company));
  for (const skill of profile.skills) assert.ok(html.includes(escapeHtml(skill.title)));
});

test('projetos são cartões completos em lista, com as onze fontes e os limites reais', () => {
  const html = renderPortfolio(profile, 'projects');
  assert.equal((html.match(/data-project=/g) || []).length, 11);
  assert.ok(!html.includes('project-art'));
  for (const project of profile.projects) {
    assert.ok(html.includes(escapeHtml(project.title)));
    assert.ok(html.includes(escapeHtml(project.url)));
    assert.ok(html.includes(escapeHtml(project.note)));
  }
  assert.ok(html.includes('Ana Karla de Souza Moretao'));
  assert.ok(html.includes('Estrutura inicial'));
});

test('sobre mantém as três experiências e formação sem atribuir títulos da referência', () => {
  const html = renderPortfolio(profile, 'about');
  for (const experience of profile.experiences) {
    assert.ok(html.includes(escapeHtml(experience.role)));
    assert.ok(html.includes(escapeHtml(experience.date)));
  }
  assert.ok(html.includes(profile.education.institution));
  assert.ok(html.includes(profile.education.status));
  assert.ok(!/Senior Java|15 anos/.test(html));
});

test('desenvolvimento apresenta Backend, Frontend e IA com projetos reais, e o Paint mantém suas ferramentas', () => {
  const development = renderPortfolio(profile, 'development');
  for (const area of ['Backend', 'Frontend', 'Inteligência Artificial']) assert.ok(development.includes(area));
  for (const repository of ['django-api', 'fenix', 'rag-sorveteria']) assert.ok(development.includes(`https://github.com/Neitolas/${repository}`));
  assert.ok(!/GitHub Actions|Fluxo de validação|Servidor/.test(development));
  const paint = renderPortfolio(profile, 'paint');
  assert.ok(paint.includes('data-paint-canvas'));
  for (const control of ['Desfazer', 'Limpar', 'Baixar PNG']) assert.ok(paint.includes(control));
});

test('conteúdo e retrato são escapados em todas as páginas', () => {
  const changed = structuredClone(profile);
  changed.name = '<script>alert(1)</script>';
  changed.projects[0].title = '<img src=x onerror=alert(1)>';
  changed.portrait.text = '<img src=x onerror=alert(1)>';
  for (const page of pages) {
    const html = renderPortfolio(changed, page);
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('<img src=x'));
  }
});

test('links externos validam protocolos e protegem a nova aba', () => {
  const changed = structuredClone(profile);
  changed.links.github = 'javascript:alert(1)';
  assert.throws(() => renderPortfolio(changed), /URL/);
  for (const page of pages) {
    const html = renderPortfolio(profile, page);
    for (const [, attrs] of html.matchAll(/<a\s+([^>]+)>/g)) {
      if (attrs.includes('target="_blank"')) assert.ok(attrs.includes('noopener noreferrer'));
    }
  }
});

test('grade de caracteres preserva tons e deixa o cenário vazio', () => {
  const lines = profile.portrait.text.split('\n');
  assert.equal(lines.length, profile.portrait.rows);
  assert.ok(lines.every(line => line.length === profile.portrait.columns));
  assert.ok(new Set(profile.portrait.text.replace(/\s/g, '')).size >= 6);
  assert.ok(lines.slice(0, Math.floor(lines.length / 2)).every(line => /^\s{20}/.test(line) && /\s{20}$/.test(line)));
});
