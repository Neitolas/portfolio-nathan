async (sourcePage, { artifactDirectory } = {}) => {
  const browser = sourcePage.context().browser();
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const base = 'http://127.0.0.1:4173/';
  const errors = [];
  const failedRequests = [];
  const requests = [];
  const results = [];
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  page.on('requestfailed', request => failedRequests.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  try {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      for (const [key, path] of [['home', ''], ['projects', 'projects/'], ['development', 'development/'], ['paint', 'paint/'], ['about', 'about/']]) {
        await page.goto(base + path, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        check(await page.locator(`[data-page="${key}"]`).count() === 1, `Página incorreta: ${path}`);
        check(await page.locator('h1').count() === 1, `Hierarquia incorreta: ${path}`);
        check(await page.locator('nav a[aria-current="page"]').count() === 1, 'Aba atual ausente');
        check(await page.getByRole('navigation').getByRole('link').count() === 5, 'Navegação incompleta');
        const geometry = await page.evaluate(() => ({ viewport: window.innerWidth, body: document.documentElement.scrollWidth, main: document.querySelector('main').scrollWidth, available: document.querySelector('main').clientWidth, reduced: getComputedStyle(document.querySelector('.ambient i')).animationName }));
        check(geometry.body <= geometry.viewport && geometry.main <= geometry.available + 1, `Rolagem horizontal em ${width}/${path}`);
        check(geometry.reduced === 'none', 'Movimento reduzido não respeitado');
        check(!/Wallace|wallacemv|Sem Parar/.test(await page.locator('body').innerText()), 'Conteúdo de terceiros no portfólio');

        const contact = page.getByRole('button', { name: 'Abrir contato', exact: true });
        await contact.click();
        const dialog = page.getByRole('dialog');
        check(await dialog.isVisible(), 'Contato não abriu');
        check(await dialog.getByRole('link', { name: 'Enviar um e-mail' }).getAttribute('href') === 'mailto:nathancarraranogueira@gmail.com', 'Contato incorreto');
        await page.keyboard.press('Escape');
        check(!await dialog.isVisible(), 'Escape não fechou o contato');
        check(await contact.evaluate(element => element === document.activeElement), 'Foco não voltou ao botão de contato');

        if (key === 'home') {
          const portrait = await page.locator('[data-portrait]').evaluate(element => {
            const frame = element.closest('figure');
            const style = getComputedStyle(frame);
            return { textLength: element.textContent.length, hidden: element.getAttribute('aria-hidden'), label: frame.getAttribute('aria-label'), bounds: element.getBoundingClientRect().toJSON(), frame: frame.getBoundingClientRect().toJSON(), background: style.backgroundColor, border: style.borderTopColor, borderWidth: style.borderTopWidth };
          });
          check(portrait.textLength > 14000 && portrait.hidden === 'true' && portrait.label.includes('Nathan'), 'Retrato incompleto');
          check(portrait.background === 'rgb(0, 0, 0)' && portrait.border === 'rgb(255, 255, 255)' && portrait.borderWidth !== '0px', 'Fundo preto ou contorno branco ausente');
          check(portrait.bounds.left >= portrait.frame.left && portrait.bounds.right <= portrait.frame.right && portrait.bounds.top >= portrait.frame.top && portrait.bounds.bottom <= portrait.frame.bottom, 'Retrato cortado');
          check(Math.abs(portrait.bounds.width / portrait.bounds.height - portrait.frame.width / portrait.frame.height) < .02, 'Retrato fora da proporção da borda');
          check(await page.locator('.identity-top, .identity-bottom, .hero-baseline').count() === 0, 'Legendas decorativas retornaram');
        }
        if (key === 'development') {
          for (const name of ['Backend', 'Frontend', 'Inteligência Artificial']) check(await page.getByRole('heading', { name, exact: true }).isVisible(), `Área de desenvolvimento ausente: ${name}`);
          check(await page.getByRole('navigation').getByRole('link', { name: 'Infra', exact: true }).count() === 0, 'Aba Infra ainda presente');
        }
        if (key === 'projects') {
          const categories = await page.locator('[data-project]').evaluateAll(elements => elements.map(element => element.dataset.project));
          check(categories.length === 11, 'Catálogo incompleto');
          const cards = await page.locator('[data-project]').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON()));
          check(cards.every((card, index) => index === 0 || card.top >= cards[index - 1].bottom), 'Projetos não estão em lista horizontal de cartões');
          for (const category of [...new Set(categories)]) {
            const button = page.locator(`[data-filter="${category}"]`);
            await button.focus();
            await page.keyboard.press('Space');
            const count = categories.filter(item => item === category).length;
            check(await page.locator('[data-project]:visible').count() === count, `Filtro incorreto: ${category}`);
            check(await button.getAttribute('aria-pressed') === 'true', 'Estado do filtro incorreto');
            check((await page.locator('[data-filter-status]').textContent()).startsWith(String(count)), 'Contagem acessível incorreta');
          }
          await page.getByRole('button', { name: 'Todos', exact: true }).click();
          const details = page.locator('details').first();
          await details.locator('summary').focus();
          await page.keyboard.press('Enter');
          check(await details.getAttribute('open') !== null, 'Detalhes não abriram pelo teclado');
          check(await details.getByText('Contribuição', { exact: true }).isVisible(), 'Detalhes indisponíveis');
          await details.locator('summary').press('Enter');
          check(await page.getByRole('link', { name: 'Ver código de F.E.N.I.X.', exact: true }).getAttribute('href') === 'https://github.com/Neitolas/fenix', 'Código incorreto');
        }
        if (artifactDirectory) await page.screenshot({ path: `${artifactDirectory}/${key}-${width}.png`, fullPage: true });
      }
      await page.getByRole('navigation').getByRole('link', { name: 'Projetos', exact: true }).click();
      check(page.url() === `${base}projects/`, 'Aba Projetos não navegou');
      await page.reload({ waitUntil: 'networkidle' });
      check(await page.locator('[data-project]').count() === 11, 'Recarregamento direto não funciona');
      results.push({ width, pages: 5, horizontalOverflow: false, navigation: true, contactKeyboard: true, whitePortraitBorder: true, projectFilters: true, projectList: true, reducedMotion: true });
    }

    await page.goto(`${base}paint/`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Colorir robô' }).click();
    const canvas = page.locator('[data-paint-canvas]');
    await page.getByRole('button', { name: 'Limpar', exact: true }).click();
    const blank = await canvas.evaluate(element => element.toDataURL());
    const bounds = await canvas.boundingBox();
    check(Math.abs(bounds.width / bounds.height - 1000 / 620) < .01, 'Canvas está distorcido');
    await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height * .3);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * .65, bounds.y + bounds.height * .6, { steps: 12 });
    await page.mouse.up();
    const drawn = await canvas.evaluate(element => element.toDataURL());
    check(drawn !== blank, 'Pincel não desenhou');
    await page.getByRole('button', { name: 'Desfazer', exact: true }).click();
    check(await canvas.evaluate(element => element.toDataURL()) === blank, 'Desfazer não restaurou os pixels');
    await canvas.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    check(await canvas.evaluate(element => element.toDataURL()) !== blank, 'Pincel pelo teclado não funciona');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Baixar PNG' }).click()]);
    check(download.suggestedFilename() === 'desenho-nathan.png' && await download.failure() === null, 'Download PNG falhou');
    await page.setViewportSize({ width: 640, height: 360 });
    const landscape = await canvas.boundingBox();
    check(landscape.width > 500 && landscape.height > 300, 'Paint encolhe em celular na horizontal');

    const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 960 } });
    try {
      const staticPage = await staticContext.newPage();
      await staticPage.goto(base, { waitUntil: 'networkidle' });
      check(await staticPage.locator('[data-portrait]').isVisible(), 'Retrato indisponível sem JS');
      await staticPage.getByRole('navigation').getByRole('link', { name: 'Projetos', exact: true }).click();
      check(await staticPage.locator('[data-project]').count() === 11, 'Projetos indisponíveis sem JS');
      await staticPage.getByRole('navigation').getByRole('link', { name: 'Sobre', exact: true }).click();
      check(await staticPage.getByText('UNIMAR', { exact: true }).isVisible(), 'Formação indisponível sem JS');
    } finally { await staticContext.close(); }
    check(errors.length === 0, errors.join(', '));
    check(failedRequests.length === 0, `Recursos ausentes: ${failedRequests.join(', ')}`);
    check(requests.every(url => url.startsWith(base)), 'Requisições externas durante o uso');
    return { results, projectCount: 11, paintDrawing: true, paintUndo: true, paintKeyboard: true, paintDownload: true, noJavaScriptNavigation: true, pageErrors: errors, failedRequests, requestOrigins: [...new Set(requests.map(url => new URL(url).origin))] };
  } finally { await context.close(); }
}
