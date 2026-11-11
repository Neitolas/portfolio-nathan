import { expect, test } from '@playwright/test';

test('registra um defeito, muda o status e mantém os dados após recarregar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Fila de defeitos' })).toBeVisible();
  await page.getByLabel('Título').fill('Formulário omite mensagem de confirmação');
  await page.getByLabel('Severidade').selectOption('high');
  await page.getByLabel('Descrição').fill('O usuário não recebe retorno depois de salvar.');
  await page.getByRole('button', { name: 'Registrar defeito' }).click();
  const item = page.getByRole('listitem').filter({ hasText: 'Formulário omite mensagem de confirmação' });
  await expect(item).toBeVisible();
  await expect(item.getByText('Severidade Alta')).toBeVisible();
  await item.getByRole('button', { name: 'Iniciar triagem' }).click();
  await expect(item.getByRole('button', { name: 'Resolver', exact: true })).toBeVisible();
  await item.getByRole('button', { name: 'Resolver', exact: true }).click();
  await expect(item.getByText('Resolvido', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('resolved');
  await page.getByRole('searchbox', { name: 'Buscar' }).fill('mensagem de confirmação');
  await expect(item).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('valida payloads e responde 404 para um defeito inexistente', async ({ request }) => {
  const api = 'http://127.0.0.1:5086/api/bugs';
  const invalid = await request.post(api, { data: { title: '  ', severity: 'critical', details: 'x'.repeat(501) } });
  expect(invalid.status()).toBe(400);
  expect(Object.keys((await invalid.json()).errors).sort()).toEqual(['details', 'severity', 'title']);
  const created = await request.post(api, { data: { title: 'Caso sintético de API', severity: 'low' } });
  expect(created.status()).toBe(201);
  const body = await created.json();
  expect((await request.get(api + '/' + body.id)).status()).toBe(200);
  const wrong = await request.patch(api + '/' + body.id + '/status', { data: { status: 'unknown' } });
  expect(wrong.status()).toBe(400);
  const missing = await request.patch(api + '/00000000-0000-4000-a000-000000000001/status', { data: { status: 'resolved' } });
  expect(missing.status()).toBe(404);
});

test('mantém o cadastro e os filtros acessíveis em tela pequena', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Registrar defeito' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Buscar' })).toBeVisible();
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
});
