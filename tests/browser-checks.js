async (page, { artifactDirectory } = {}) => {
  const base = 'http://127.0.0.1:4173/';
  const errors = [];
  const failedRequests = [];
  const requests = [];
  const results = [];
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });

  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(base, { waitUntil: 'networkidle' });
    check((await page.title()).includes('Nathan Nogueira Carrara'), 'Título incorreto');
    check(await page.locator('h1').count() === 1, 'É necessário um h1');
    check(await page.locator('[data-project]:visible').count() === 3, 'Os três projetos devem aparecer inicialmente');
    const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    check(dimensions.scrollWidth <= width, `Rolagem horizontal em ${width}: ${dimensions.scrollWidth}`);

    if (width === 360) {
      const toggle = page.getByRole('button', { name: 'Menu', exact: true });
      check(await toggle.isVisible(), 'Menu móvel ausente');
      check(!(await page.locator('[data-nav]').isVisible()), 'Navegação móvel deveria começar fechada');
      await toggle.focus();
      await page.keyboard.press('Tab');
      check(await page.evaluate(() => document.activeElement.getAttribute('href')) === '#projetos', 'Menu oculto entrou na navegação por teclado');
      await toggle.click();
      check(await page.locator('[data-nav]').isVisible(), 'Menu não abriu');
      await page.getByRole('navigation').getByRole('link', { name: 'Experiência', exact: true }).focus();
      await page.keyboard.press('Escape');
      check(await toggle.getAttribute('aria-expanded') === 'false', 'Escape não fechou o menu');
      check(await toggle.evaluate((element) => element === document.activeElement), 'Escape não devolveu o foco');
      await toggle.click();
      await page.getByRole('navigation').getByRole('link', { name: 'Projetos', exact: true }).click();
      check(page.url().endsWith('#projetos'), 'Âncora móvel não navegou');
      check(await toggle.getAttribute('aria-expanded') === 'false', 'Navegação não fechou o menu');
    }

    await page.getByRole('button', { name: 'Backend', exact: true }).focus();
    await page.keyboard.press('Space');
    check(await page.locator('[data-project]:visible').count() === 1, 'Filtro Backend incorreto');
    check(await page.getByRole('heading', { name: 'API de gestão de usuários', exact: true }).isVisible(), 'API oculta no filtro Backend');
    check(await page.locator('[data-filter-status]').textContent() === '1 projeto exibido.', 'Contagem acessível incorreta');
    await page.getByRole('button', { name: 'Full Stack', exact: true }).click();
    check(await page.locator('[data-project]:visible').count() === 2, 'Filtro Full Stack incorreto');
    check(await page.getByRole('button', { name: 'Full Stack', exact: true }).getAttribute('aria-pressed') === 'true', 'Estado acessível do filtro incorreto');
    await page.getByRole('button', { name: 'Todos', exact: true }).click();
    const details = page.locator('details').first();
    await details.locator('summary').focus();
    await page.keyboard.press('Enter');
    check(await details.getAttribute('open') !== null, 'Detalhes não abriram com teclado');
    check(await details.getByRole('link', { name: 'Consultar evidência' }).isVisible(), 'Evidência indisponível');
    await details.locator('summary').press('Enter');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const id of ['projetos', 'experiencia', 'sobre', 'contato']) {
      await page.goto(`${base}#${id}`, { waitUntil: 'networkidle' });
      const top = await page.locator(`#${id} h2`).evaluate((element) => element.getBoundingClientRect().top);
      check(top >= 72, `Cabeçalho encobre ${id} em ${width}: ${top}`);
    }
    const motion = await page.evaluate(() => ({ scroll: getComputedStyle(document.documentElement).scrollBehavior, transition: getComputedStyle(document.querySelector('.button')).transitionDuration }));
    check(motion.scroll === 'auto' && motion.transition === '0s', 'Movimento reduzido não respeitado');
    await page.goto(base, { waitUntil: 'networkidle' });
    if (artifactDirectory) {
      await page.screenshot({ path: `${artifactDirectory}/viewport-${width}.png`, fullPage: true });
    }
    results.push({ width, horizontalOverflow: false, projectFilters: true, keyboardDetails: true, anchors: true, reducedMotion: true, mobileMenu: width === 360 ? true : 'não aplicável' });
  }

  const browser = page.context().browser();
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 960 } });
  const staticPage = await noJs.newPage();
  await staticPage.goto(base, { waitUntil: 'networkidle' });
  check(await staticPage.getByRole('heading', { name: 'Nathan Nogueira Carrara', exact: true }).isVisible(), 'Identidade indisponível sem JS');
  check(await staticPage.locator('[data-project]').count() === 3, 'Projetos indisponíveis sem JS');
  check(await staticPage.getByRole('navigation').isVisible(), 'Navegação indisponível sem JS');
  check(await staticPage.getByRole('link', { name: 'Enviar um e-mail', exact: true }).getAttribute('href') === 'mailto:nathancarraranogueira@gmail.com', 'Contato incorreto');
  await noJs.close();
  check(errors.length === 0, `Erros no navegador: ${errors.join(', ')}`);
  check(failedRequests.length === 0, `Recursos ausentes: ${failedRequests.join(', ')}`);
  check(requests.every((url) => url.startsWith(base)), 'A página fez requisições externas');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base);
  return { results, noJavaScript: true, pageErrors: errors, failedRequests, requestOrigins: [...new Set(requests.map((url) => new URL(url).origin))] };
}
