export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

const e = escapeHtml;
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.6"/></svg>';
const down = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6" stroke="currentColor" stroke-width="1.5"/></svg>';

function link(url, label, className = '') {
  const parsed = new URL(url);
  if (!['https:', 'mailto:'].includes(parsed.protocol)) throw new Error('URL externa inválida');
  const external = parsed.protocol === 'https:' ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${e(url)}" class="${e(className)}"${external}>${e(label)}${arrow}</a>`;
}

function tags(items) {
  return `<ul class="tags">${items.map((item) => `<li>${e(item)}</li>`).join('')}</ul>`;
}

function projectArt(project) {
  if (project.id === 'fenix') {
    return `<div class="project-art fenix-art" aria-hidden="true">

      <div class="fenix-mark">F<span>↗</span></div>
      <div class="module-map"><span><i></i>Inventário</span><b>→</b><span><i></i>Operação</span><b>→</b><span><i></i>Prevenção</span></div>

    </div>`;
  }
  if (project.id === 'api') {
    return `<div class="project-art api-art" aria-hidden="true">
      <div class="endpoint"><span>GET</span><code>/api/</code><b>↗</b></div>
      <div class="code-lines"><span>{</span><span>&nbsp; "user_nickname": <b>"nathan"</b>,</span><span>&nbsp; "user_name": <b>"Nathan"</b></span><span>}</span></div>
      </div>`;
  }
  if (project.id === 'estacionamento') return `<div class="project-art parking-art" aria-hidden="true">
    <div class="parking-symbol">P<span>↗</span></div><div class="parking-flow"><span>Entrada</span><i></i><span>Permanência</span><i></i><span>Saída</span></div>
    </div>`;
  const visual = project.visual ?? { mark: '</>', label: project.categoryLabel, steps: project.technologies.slice(0, 3), tone: 'blue' };
  return `<div class="project-art catalog-art tone-${e(visual.tone)}" aria-hidden="true"><div class="catalog-mark">${e(visual.mark)}<span>↗</span></div><div class="catalog-flow">${visual.steps.map((step) => `<span>${e(step)}</span>`).join('<i>→</i>')}</div></div>`;
}

function projectCard(project, index) {
  return `<article class="project-card ${index === 0 ? 'featured' : ''}" data-project="${e(project.category)}" aria-labelledby="project-${e(project.id)}">
    ${projectArt(project)}
    <div class="project-copy"><div class="project-context"><span>${e(project.context)}</span><span>${e(project.categoryLabel)}</span></div>
    <h3 id="project-${e(project.id)}">${e(project.title)}</h3>
    <p>${e(project.description)}</p>${tags(project.technologies)}
    <details><summary>Detalhes <span aria-hidden="true">+</span></summary>
      <div class="project-detail"><h4>Contribuição</h4><p>${e(project.contribution)}</p><h4>Implementação</h4><p>${e(project.implementation)}</p><p class="project-note">${e(project.note)}</p>${link(project.evidence, 'Ver implementação', 'text-link')}</div>
    </details><div class="project-links">${link(project.url, `Ver código de ${project.title}`, 'text-link')}</div></div>
  </article>`;
}

export function renderPortfolio(profile) {
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="site-header" data-header><div class="header-inner">
    <a class="wordmark" href="#inicio" aria-label="${e(profile.name)} — início">n<span>.</span>c<span class="wordmark-slash">/</span></a>
    <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="navigation" hidden><span>Menu</span><span class="menu-lines" aria-hidden="true"></span></button>
    <nav id="navigation" data-nav aria-label="Navegação principal">${profile.navigation.map((item) => `<a href="#${e(item.id)}"${item.id === 'contato' ? ' class="nav-contact"' : ''}>${e(item.label)}${item.id === 'contato' ? arrow : ''}</a>`).join('')}</nav>
  </div></header>
  <main id="conteudo">
    <section id="inicio" class="hero container" aria-labelledby="hero-title"><div class="hero-copy">
      <p class="eyebrow"><span class="status-dot"></span>${e(profile.role)}</p>
      <h1 id="hero-title" aria-label="${e(profile.name)}">${e(profile.firstName)}<br><span>${e(profile.lastName)}</span><span class="name-dot">.</span></h1>
      <p class="hero-description">${e(profile.description)}</p>
      <div class="hero-actions"><a class="button button-primary" href="#projetos">Ver projetos ${down}</a><a class="button button-quiet" href="#contato">Vamos conversar ${arrow}</a></div>
      <div class="hero-socials">${link(profile.links.github, 'GitHub', 'text-link')}${link(profile.links.linkedin, 'LinkedIn', 'text-link')}</div>
    </div>
    <figure class="portrait-frame" role="img" aria-label="Retrato de ${e(profile.name)} em caracteres ASCII"><pre class="ascii-portrait" data-portrait aria-hidden="true" style="--portrait-columns:${e(profile.portrait.columns)}">${e(profile.portrait.text)}</pre>
    </figure>
    </section>

    <section id="projetos" class="section container" aria-labelledby="projects-title"><div class="section-heading"><h2 id="projects-title">Projetos</h2></div>
      <div class="project-toolbar"><span class="small-label">${profile.projects.length} PROJETOS E ESTUDOS</span><div class="filters" data-filters role="group" aria-label="Filtrar projetos" hidden><button type="button" data-filter="all" aria-pressed="true">Todos</button>${[...new Map(profile.projects.map((project) => [project.category, project.categoryLabel]))].map(([category, label]) => `<button type="button" data-filter="${e(category)}" aria-pressed="false">${e(label)}</button>`).join('')}</div></div>
      <p class="visually-hidden" data-filter-status role="status" aria-live="polite"></p>
      <div class="project-grid">${profile.projects.map(projectCard).join('')}</div>
      <div class="section-end">${link(profile.links.github, 'Explorar meu GitHub', 'text-link')}</div>
    </section>

    <section id="experiencia" class="section experience-section" aria-labelledby="experience-title"><div class="container experience-layout"><div class="experience-intro"><h2 id="experience-title">Experiência</h2></div>
      <ol class="timeline">${profile.experiences.map((experience, index) => `<li><div class="timeline-marker">${String(index + 1).padStart(2, '0')}</div><div class="timeline-content"><p class="timeline-date">${e(experience.date)}</p><h3>${e(experience.company)}</h3><p class="timeline-role">${e(experience.role)}</p><p>${e(experience.description)}</p>${tags(experience.tags)}${experience.source ? link(experience.source, 'Relato público da experiência', 'source-link') : ''}</div></li>`).join('')}</ol>
    </div></section>

    <section id="sobre" class="section container" aria-labelledby="about-title"><div class="about-layout"><div><h2 id="about-title">Sobre</h2><p class="about-description">${e(profile.about)}</p><div class="education"><span class="education-icon" aria-hidden="true">↗</span><div><span class="small-label">${e(profile.education.status)} · ${e(profile.education.institution)}</span><h3>${e(profile.education.title)}</h3></div></div></div>
      <div class="skills">${profile.skills.map((skill) => `<div class="skill-group"><h3>${e(skill.title)}</h3>${tags(skill.items)}</div>`).join('')}</div></div>
    </section>

    <section id="contato" class="contact-section" aria-labelledby="contact-title"><div class="container"><div class="contact-heading"><h2 id="contact-title">Contato</h2><span class="contact-arrow" aria-hidden="true">↗</span></div><div class="contact-links">${link(`mailto:${profile.email}`, 'Enviar um e-mail', 'button button-primary')}${link(profile.links.linkedin, 'Conversar no LinkedIn', 'button button-outline')}${link(profile.links.github, 'Conhecer meu GitHub', 'text-link')}</div><a class="email-address" href="mailto:${e(profile.email)}">${e(profile.email)}</a></div></section>
  </main><footer class="site-footer container"><span class="footer-name">${e(profile.name)}</span><a href="#inicio">Voltar ao início ${arrow}</a></footer>`;
}
