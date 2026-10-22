async sourcePage => {
  const context = await sourcePage.context().browser().newContext({ hasTouch: true, viewport: { width: 640, height: 360 } });
  const page = await context.newPage();
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  try {
    await page.goto('http://127.0.0.1:4173/paint/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Colorir robô' }).click();
    const canvas = page.locator('canvas');
    check((await canvas.boundingBox()).width > 500, 'Canvas minúsculo em paisagem');
    await page.setViewportSize({ width: 640, height: 320 });
    await page.getByRole('button', { name: 'Abrir contato' }).click();
    const dialog = await page.getByRole('dialog').boundingBox();
    const close = await page.getByRole('button', { name: 'Fechar contato' }).boundingBox();
    check(dialog.y >= 0 && dialog.y + dialog.height <= 320 && close.y >= 0, 'Contato sai da janela baixa');
    await page.keyboard.press('Escape');

    await page.evaluate(async () => {
      const original = window.createImageBitmap.bind(window);
      window.__restoreBitmap = () => { window.createImageBitmap = original; };
      window.createImageBitmap = async file => {
        const bitmap = await original(file);
        window.__pendingBitmap = bitmap;
        await new Promise(resolve => { window.__releaseBitmap = resolve; });
        return bitmap;
      };
      const image = document.createElement('canvas');
      image.width = 4; image.height = 4;
      image.getContext('2d').fillRect(0, 0, 4, 4);
      const blob = await new Promise(resolve => image.toBlob(resolve));
      const transfer = new window.DataTransfer();
      transfer.items.add(new window.File([blob], 'teste.png', { type: 'image/png' }));
      const input = document.querySelector('[data-paint-upload]');
      input.files = transfer.files;
      input.dispatchEvent(new window.Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => typeof window.__releaseBitmap === 'function');
    await page.getByRole('button', { name: 'Colorir paisagem' }).click();
    const latest = await canvas.evaluate(element => element.toDataURL());
    await page.evaluate(() => window.__releaseBitmap());
    await page.waitForFunction(() => window.__pendingBitmap.width === 0);
    check(await canvas.evaluate(element => element.toDataURL()) === latest, 'Upload antigo substituiu ação recente');
    await page.evaluate(() => window.__restoreBitmap());

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Limpar', exact: true }).click();
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    const cdp = await context.newCDPSession(page);
    const left = { x: box.x + box.width * .2, y: box.y + box.height * .5, id: 1 };
    const right = { x: box.x + box.width * .8, y: box.y + box.height * .5, id: 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [left] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [left, right] });
    left.x += 10;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [left, right] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [left] });
    left.x += 10;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [left] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const pixels = await canvas.evaluate(element => {
      const ctx = element.getContext('2d');
      return { middle: [...ctx.getImageData(500, 310, 1, 1).data], first: [...ctx.getImageData(210, 310, 1, 1).data] };
    });
    check(pixels.middle.slice(0, 3).every(value => value === 255), 'Segundo dedo criou linha atravessada');
    check(pixels.first.slice(0, 3).some(value => value !== 255), 'Primeiro dedo não desenhou');
    await cdp.detach();
    return { landscapeCanvas: true, shortViewportContact: true, staleUploadDiscarded: true, staleBitmapClosed: true, multiTouchIsolation: true };
  } finally { await context.close(); }
}
