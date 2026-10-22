import './style.css';

const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

function closeMenu(returnFocus = false) {
  menu.setAttribute('aria-expanded', 'false');
  if (returnFocus) menu.focus();
}

menu.hidden = false;
header.dataset.enhanced = 'true';
menu.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') !== 'true'));
});
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
window.matchMedia('(min-width: 701px)').addEventListener('change', () => closeMenu());

const filters = document.querySelector('[data-filters]');
const projects = [...document.querySelectorAll('[data-project]')];
const status = document.querySelector('[data-filter-status]');
filters.hidden = false;
filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  for (const filter of filters.querySelectorAll('button')) {
    filter.setAttribute('aria-pressed', String(filter === button));
  }
  for (const project of projects) {
    project.hidden = button.dataset.filter !== 'all' && project.dataset.project !== button.dataset.filter;
  }
  const count = projects.filter((project) => !project.hidden).length;
  status.textContent = `${count} ${count === 1 ? 'projeto exibido' : 'projetos exibidos'}.`;
});
