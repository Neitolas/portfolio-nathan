import './style.css';
import { mountPaint } from './paint.js';

const filters = document.querySelector('[data-filters]');
if (filters) {
  const projects = [...document.querySelectorAll('[data-project]')];
  const status = document.querySelector('[data-filter-status]');
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    for (const filter of filters.querySelectorAll('button')) filter.setAttribute('aria-pressed', String(filter === button));
    for (const project of projects) project.hidden = button.dataset.filter !== 'all' && project.dataset.project !== button.dataset.filter;
    const count = projects.filter(project => !project.hidden).length;
    status.textContent = `${count} ${count === 1 ? 'projeto exibido' : 'projetos exibidos'}.`;
  });
}

const contactButton = document.querySelector('[data-contact-toggle]');
const contactDialog = document.querySelector('[data-contact-dialog]');
contactButton.hidden = false;
contactButton.addEventListener('click', () => contactDialog.showModal());
document.querySelector('[data-contact-close]').addEventListener('click', () => contactDialog.close());
contactDialog.addEventListener('close', () => contactButton.focus());

const paint = document.querySelector('[data-paint]');
if (paint) mountPaint(paint);
