export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

const e = escapeHtml;
export const pages = {
  home: { label: 'Home', path: '', icon: 'home' },
  projects: { label: 'Projetos', path: 'projects/', icon: 'projects' },
  infra: { label: 'Infra', path: 'infra/', icon: 'infra' },
  paint: { label: 'Paint', path: 'paint/', icon: 'paint' },
  about: { label: 'Sobre', path: 'about/', icon: 'person' },
};

const symbols = {
  home: '<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>',
  projects: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M8 3v18M12 7v4m4-4v7"/>',
  infra: '<path d="m3 9 9-6 9 6v10H3ZM7 10h10v11H7Zm3 4h4m-4 3h4"/>',
  paint: '<path d="M4 3h16v18H4ZM8 3v6h8V3M8 21v-7h8v7"/>',
  person: '<rect x="3" y="5" width="18" height="16" rx="1"/><circle cx="12" cy="11" r="2.5"/><path d="M7 18c0-5 10-5 10 0M8 3v4m8-4v4"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  github: '<path d="M9 21v-4c-4 1-4-2-6-2m12 6v-4c0-1 .2-1.6-.5-2.3 3-.3 5.5-1.5 5.5-5.2 0-1.2-.4-2.3-1.3-3.2.2-.6.5-2-.2-3.3 0 0-1.2-.4-3.5 1a13 13 0 0 0-6 0C6.7 2.6 5.5 3 5.5 3c-.7 1.3-.4 2.7-.2 3.3A4.7 4.7 0 0 0 4 9.5c0 3.7 2.5 4.9 5.5 5.2C8.8 15.4 9 16 9 17"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="1"/><path d="m2 5 10 8L22 5"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3c0-4 6-4 6 0v4"/>',
  chat: '<path d="M21 11a9 9 0 0 1-9 9c-1.5 0-2.7-.3-4-.8L3 21l1.8-5A9 9 0 1 1 21 11Z"/><path d="M8 11h.1m3.9 0h.1m3.9 0h.1"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
  cart: '<path d="M2 3h3l3 13h11l3-10H6M9 20h.1m8.9 0h.1"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[name] ?? symbols.code}</svg>`;
}

function link(url, label, className = '', symbol = 'external', iconOnly = false) {
  const parsed = new URL(url);
  if (!['https:', 'mailto:'].includes(parsed.protocol)) throw new Error('URL externa inválida');
  const external = parsed.protocol === 'https:' ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${e(url)}" class="${e(className)}"${external}${iconOnly ? ` aria-label="${e(label)}" title="${e(label)}"` : ''}>${iconOnly ? '' : e(label)}${icon(symbol)}</a>`;
}

function tags(items) {
  return `<ul class="tags">${items.map(item => `<li>${e(item)}</li>`).join('')}</ul>`;
}

function skills(profile) {
  return `<section class="skills-section" aria-labelledby="skills-title"><h2 id="skills-title">Principais competências</h2><div class="skills-grid">${profile.skills.map(skill => `<div class="skill-group"><h3>${e(skill.title)}</h3>${tags(skill.items)}</div>`).join('')}</div></section>`;
}

function experiences(profile, compact = false) {
  return `<section id="experiencia" class="experience-section" aria-labelledby="experience-title"><h2 id="experience-title">Experiências profissionais${compact ? ' recentes' : ''}</h2><div class="experience-grid${compact ? '' : ' full'}">${profile.experiences.map((item, index) => `<article class="experience-card accent-${index}"><h3>${e(item.role)}</h3><p class="company">${e(item.company)}</p><p class="experience-date">${e(item.date)}</p><p>${e(item.description)}</p>${compact ? '' : tags(item.tags)}</article>`).join('')}</div></section>`;
}

function projectCard(project) {
  return `<article class="project-card panel" data-project="${e(project.category)}" aria-labelledby="project-${e(project.id)}"><div class="project-heading"><h2 id="project-${e(project.id)}">${icon(project.id === 'carrinho' ? 'cart' : 'code')}${e(project.title)}</h2><div class="project-actions">${link(project.url, `Ver código de ${project.title}`, 'icon-link', 'github', true)}${link(project.evidence, `Ver implementação de ${project.title}`, 'icon-link', 'external', true)}</div></div><p class="project-context">${e(project.context)}</p><p class="project-description">${e(project.description)}</p>${tags(project.technologies)}<details><summary>Detalhes <span aria-hidden="true">+</span></summary><div class="project-detail"><h3>Contribuição</h3><p>${e(project.contribution)}</p><h3>Implementação</h3><p>${e(project.implementation)}</p><p class="project-note">${e(project.note)}</p></div></details></article>`;
}

function homePage(profile, root) {
  return `<section id="inicio" class="hero" aria-labelledby="page-title"><div class="hero-copy"><h1 id="page-title">${e(profile.name)}<span class="typing-caret" aria-hidden="true">|</span></h1><p class="hero-role">${e(profile.role)} | Python · Django · React</p><div class="hero-summary panel"><p>${e(profile.description)}</p><a class="text-link" href="${root}about/">Ver trajetória completa ${icon('arrow')}</a></div></div><figure class="portrait-frame" role="img" aria-label="Retrato de ${e(profile.name)} em caracteres ASCII"><pre class="ascii-portrait" data-portrait aria-hidden="true" style="--portrait-columns:${e(profile.portrait.columns)}">${e(profile.portrait.text)}</pre></figure></section>${skills(profile)}${experiences(profile, true)}<a class="text-link more-link" href="${root}about/">Saiba mais ${icon('arrow')}</a>`;
}

function projectsPage(profile) {
  return `<h1 id="page-title">Projetos</h1><div class="project-toolbar"><span>${profile.projects.length} projetos e estudos</span><div class="filters" data-filters role="group" aria-label="Filtrar projetos" hidden><button type="button" data-filter="all" aria-pressed="true">Todos</button>${[...new Map(profile.projects.map(project => [project.category, project.categoryLabel]))].map(([category, label]) => `<button type="button" data-filter="${e(category)}" aria-pressed="false">${e(label)}</button>`).join('')}</div></div><p class="visually-hidden" data-filter-status role="status" aria-live="polite"></p><div class="project-list">${profile.projects.map(projectCard).join('')}</div>`;
}

function aboutPage(profile) {
  return `<h1 id="page-title">Sobre</h1><section class="panel about-intro"><p>${e(profile.about)}</p><p>${e(profile.description)}</p></section>${skills(profile)}${experiences(profile)}<section class="education-section"><h2>Formação acadêmica</h2><div class="panel education-card"><h3>${e(profile.education.title)}</h3><p>${e(profile.education.institution)}</p><p class="experience-date">${e(profile.education.status)}</p></div></section>`;
}

function infraPage(profile) {
  return `<h1 id="page-title">Infraestrutura</h1><section class="panel infra-panel"><h2>${icon('infra')}Este portfólio</h2><div class="infra-grid"><article><h3>Site estático</h3><p>HTML, CSS e JavaScript. Build com Vite e fontes servidas pelo próprio site.</p></article><article><h3>Versionamento</h3><p>Repositório público no GitHub, com histórico de alterações na branch main.</p></article><article><h3>GitHub Actions</h3><p>Lint, testes e build a cada push e pull request.</p></article><article><h3>Retrato ASCII</h3><p>Gerado localmente com a minha foto. Os caracteres fazem parte do HTML.</p></article></div><div class="infra-links">${link(profile.siteRepository, 'Repositório', 'text-link', 'github')}${link(`${profile.siteRepository}/actions`, 'Ver validações', 'text-link')}</div></section><section class="panel infra-panel pipeline-panel"><h2>${icon('projects')}Fluxo de validação</h2><ol class="pipeline"><li><span>1</span><div><h3>Commit</h3><p>Alteração versionada no GitHub.</p></div></li><li><span>2</span><div><h3>Verificações</h3><p>ESLint e testes automatizados.</p></div></li><li><span>3</span><div><h3>Build</h3><p>Arquivos estáticos gerados em dist.</p></div></li></ol></section>`;
}

function paintPage() {
  return `<h1 id="page-title" class="visually-hidden">Paint</h1><section class="paint-workspace" data-paint><div class="paint-picker" data-paint-picker hidden><button type="button" class="template-button" data-paint-template="robot" aria-label="Colorir robô"><svg viewBox="0 0 100 100" fill="none" stroke="#334155" stroke-width="1.5" aria-hidden="true"><path d="M50 12v10m-4-12h8M28 27h44v35H28Zm8 7h8v8h-8Zm20 0h8v8h-8ZM39 52h22M35 62v21h30V62M28 36H17v27h11m44-27h11v27H72M41 83v10H28m31-10v10h13M45 70h10v7H45Z"/></svg></button><button type="button" class="template-button" data-paint-template="landscape" aria-label="Colorir paisagem"><svg viewBox="0 0 100 100" fill="none" stroke="#334155" stroke-width="1.5" aria-hidden="true"><circle cx="72" cy="24" r="11"/><path d="m5 66 25-35 28 35m-12-15 14-18 35 33M22 43l8 5 8-5M5 66h90M8 77c20-12 37 10 57 0s22-3 29-2M6 88c20-8 34 8 55 0s23-7 33-4"/></svg></button><label class="paint-upload">Selecionar imagem<input data-paint-upload type="file" accept="image/png,image/jpeg,image/webp" aria-label="Selecionar imagem"></label></div><div class="paint-toolbar" data-paint-tools hidden><label class="color-control">Cor<input data-paint-color type="color" value="#1e293b"></label><label class="brush-control">Pincel<input data-paint-size type="range" min="1" max="40" value="5"></label><button type="button" data-paint-undo disabled>Desfazer</button><button type="button" data-paint-clear>Limpar</button><button type="button" data-paint-save>Baixar PNG</button></div><canvas data-paint-canvas width="1000" height="620" tabindex="0" aria-label="Área de desenho. Use as setas para mover o pincel e Espaço para desenhar." hidden>Área de desenho</canvas><p class="visually-hidden" data-paint-status role="status" aria-live="polite"></p><noscript><p>Ative o JavaScript para desenhar.</p></noscript></section><svg class="paint-waves" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true"><path fill="#e0457455" d="M0 55Q130 150 300 75T600 90T900 60T1200 85T1440 55V200H0Z"/><path fill="#be185d88" d="M0 105Q190 5 390 95T760 80T1100 100T1440 65V200H0Z"/><path fill="#9d174d99" d="M0 80Q200 170 420 115T850 110T1220 100T1440 120V200H0Z"/></svg>`;
}

export function renderPortfolio(profile, page = 'home') {
  if (!Object.hasOwn(pages, page)) throw new Error('Página inválida');
  const root = page === 'home' ? './' : '../';
  const content = page === 'home' ? homePage(profile, root) : page === 'projects' ? projectsPage(profile) : page === 'about' ? aboutPage(profile) : page === 'infra' ? infraPage(profile) : paintPage();
  return `<div class="site-shell" data-page="${page}"><a class="skip-link" href="#conteudo">Pular para o conteúdo</a><div class="ambient" aria-hidden="true">${Array.from({ length: 12 }, () => '<i></i>').join('')}</div><header class="site-header"><nav aria-label="Navegação principal">${Object.entries(pages).map(([key, item]) => `<a href="${root}${item.path}" class="nav-tab nav-${key}"${key === page ? ' aria-current="page"' : ''}>${icon(item.icon)}<span>${item.label}</span></a>`).join('')}</nav></header><main id="conteudo" class="page page-${page}" tabindex="-1">${content}</main><footer class="site-footer">${link(`mailto:${profile.email}`, profile.email, 'footer-email', 'mail')}${link(profile.links.github, 'GitHub de Nathan', 'icon-link', 'github', true)}${link(profile.links.linkedin, 'LinkedIn de Nathan', 'icon-link', 'linkedin', true)}</footer><div class="contact-widget"><span class="contact-hint">Fale comigo!</span><button class="contact-toggle" type="button" data-contact-toggle aria-label="Abrir contato" aria-haspopup="dialog" hidden>${icon('chat')}</button></div><dialog class="contact-panel" data-contact-dialog aria-labelledby="contact-title"><div class="contact-heading"><h2 id="contact-title">Vamos conversar?</h2><button type="button" data-contact-close aria-label="Fechar contato">${icon('close')}</button></div><p>${e(profile.name)}</p><div class="contact-links">${link(`mailto:${profile.email}`, 'Enviar um e-mail', 'contact-link', 'mail')}${link(profile.links.linkedin, 'Conversar no LinkedIn', 'contact-link', 'linkedin')}${link(profile.links.github, 'Conhecer meu GitHub', 'contact-link', 'github')}</div></dialog></div>`;
}
