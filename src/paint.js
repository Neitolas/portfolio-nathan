export function mountPaint(root) {
  const canvas = root.querySelector('[data-paint-canvas]');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const color = root.querySelector('[data-paint-color]');
  const size = root.querySelector('[data-paint-size]');
  const undoButton = root.querySelector('[data-paint-undo]');
  const status = root.querySelector('[data-paint-status]');
  const history = [];
  let revision = 0;
  let activePointerId = null;
  let keyboardDrawing = false;
  let position = { x: canvas.width / 2, y: canvas.height / 2 };

  function clear() {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  function remember() {
    revision++;
    history.push(context.getImageData(0, 0, canvas.width, canvas.height));
    if (history.length > 10) history.shift();
    undoButton.disabled = false;
  }
  function line(from, to) {
    revision++;
    context.strokeStyle = color.value;
    context.lineWidth = Number(size.value);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }
  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
  }
  function showWorkspace() {
    canvas.hidden = false;
    root.querySelector('[data-paint-tools]').hidden = false;
  }
  function template(kind) {
    remember();
    clear();
    showWorkspace();
    context.save();
    context.translate(190, 15);
    context.scale(6, 6);
    context.strokeStyle = '#4e3268';
    context.lineWidth = .7;
    context.lineJoin = 'round';
    context.beginPath();
    if (kind === 'robot') {
      context.rect(28, 27, 44, 35);
      context.rect(36, 34, 8, 8);
      context.rect(56, 34, 8, 8);
      context.moveTo(50, 12); context.lineTo(50, 27);
      context.moveTo(46, 12); context.lineTo(54, 12);
      context.moveTo(39, 52); context.lineTo(61, 52);
      context.rect(35, 62, 30, 21);
      context.rect(17, 36, 11, 27);
      context.rect(72, 36, 11, 27);
      context.moveTo(41, 83); context.lineTo(41, 93); context.lineTo(28, 93);
      context.moveTo(59, 83); context.lineTo(59, 93); context.lineTo(72, 93);
      context.rect(45, 70, 10, 7);
    } else {
      context.arc(72, 24, 11, 0, Math.PI * 2);
      context.moveTo(5, 66); context.lineTo(30, 31); context.lineTo(58, 66);
      context.moveTo(46, 51); context.lineTo(60, 33); context.lineTo(95, 66);
      context.moveTo(22, 43); context.lineTo(30, 48); context.lineTo(38, 43);
      context.moveTo(5, 66); context.lineTo(95, 66);
      context.moveTo(8, 77); context.bezierCurveTo(28, 65, 45, 87, 65, 77); context.bezierCurveTo(85, 67, 87, 74, 94, 75);
      context.moveTo(6, 88); context.bezierCurveTo(26, 80, 40, 96, 61, 88); context.bezierCurveTo(82, 80, 84, 81, 94, 84);
    }
    context.stroke();
    context.restore();
    keyboardDrawing = false;
  }
  clear();
  root.querySelector('[data-paint-picker]').hidden = false;
  for (const button of root.querySelectorAll('[data-paint-template]')) button.addEventListener('click', () => template(button.dataset.paintTemplate));
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || activePointerId !== null) return;
    event.preventDefault();
    remember();
    activePointerId = event.pointerId;
    keyboardDrawing = false;
    canvas.setPointerCapture(event.pointerId);
    position = point(event);
    line(position, { x: position.x + .1, y: position.y });
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointerId) return;
    const next = point(event);
    line(position, next);
    position = next;
  });
  function endPointer(event) {
    if (event.pointerId === activePointerId) activePointerId = null;
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('lostpointercapture', endPointer);
  canvas.addEventListener('blur', () => { keyboardDrawing = false; });
  canvas.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault();
      keyboardDrawing = !keyboardDrawing;
      if (keyboardDrawing) remember();
      status.textContent = keyboardDrawing ? 'Pincel ativo.' : 'Pincel pausado.';
      return;
    }
    const steps = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    const next = { x: Math.max(0, Math.min(canvas.width, position.x + step[0])), y: Math.max(0, Math.min(canvas.height, position.y + step[1])) };
    if (keyboardDrawing) line(position, next);
    position = next;
  });
  undoButton.addEventListener('click', () => {
    if (!history.length) return;
    revision++;
    context.putImageData(history.pop(), 0, 0);
    undoButton.disabled = history.length === 0;
    keyboardDrawing = false;
    status.textContent = 'Última ação desfeita.';
  });
  root.querySelector('[data-paint-clear]').addEventListener('click', () => {
    remember();
    clear();
    keyboardDrawing = false;
    status.textContent = 'Desenho limpo.';
  });
  root.querySelector('[data-paint-save]').addEventListener('click', () => {
    const download = canvas.ownerDocument.createElement('a');
    download.download = 'desenho-nathan.png';
    download.href = canvas.toDataURL('image/png');
    download.click();
  });
  root.querySelector('[data-paint-upload]').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    let requestRevision = ++revision;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      status.textContent = 'Escolha PNG, JPG ou WebP de até 10 MB.';
      return;
    }
    let bitmap;
    try {
      bitmap = await canvas.ownerDocument.defaultView.createImageBitmap(file);
      if (requestRevision !== revision) return;
      remember();
      requestRevision = revision;
      clear();
      showWorkspace();
      const scale = Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height);
      const width = bitmap.width * scale;
      const height = bitmap.height * scale;
      context.drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      keyboardDrawing = false;
      status.textContent = 'Imagem carregada.';
    } catch {
      if (requestRevision === revision) status.textContent = 'Não foi possível abrir esta imagem.';
    } finally {
      bitmap?.close();
      event.target.value = '';
    }
  });
}
