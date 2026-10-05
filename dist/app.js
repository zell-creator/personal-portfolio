(() => {
  'use strict';
  const data = window.PORTFOLIO;
  const slider = document.querySelector('#project-slider');
  const previous = document.querySelector('#previous-projects');
  const next = document.querySelector('#next-projects');
  const dialog = document.querySelector('#project-lightbox');
  const viewer = document.querySelector('#lightbox-view');
  const largeImage = document.querySelector('#lightbox-image');
  const loading = document.querySelector('#lightbox-loading');
  const close = dialog.querySelector('.lightbox-close');
  const liveLink = document.querySelector('#lightbox-live');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let trigger = null;
  let pointerStart = null;

  function safeUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value, document.baseURI);
      return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  function chevron() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', 'm9 5 7 7-7 7');
    svg.append(path);
    return svg;
  }
  const cards = data.projects.map((project, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `project-card${project.fit === 'contain' ? ' contain' : ''}`;
    card.setAttribute('aria-label', `View ${project.name} — project ${index + 1} of ${data.projects.length}`);
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-controls', 'project-lightbox');
    const image = document.createElement('img');
    image.src = project.image;
    image.alt = `${project.name} design`;
    image.loading = index < 3 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    const caption = document.createElement('span');
    caption.className = 'project-caption';
    caption.textContent = project.name;
    caption.append(chevron());
    card.append(image, caption);
    card.addEventListener('click', () => openProject(index, card));
    slider.append(card);
    return card;
  });

  data.websites.forEach(site => {
    const card = document.createElement('a');
    card.className = 'website-card';
    card.href = safeUrl(site.url);
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.setAttribute('aria-label', `Visit ${site.name} (opens in a new tab)`);
    const wrap = document.createElement('span');
    wrap.className = 'logo-wrap';
    wrap.style.backgroundColor = site.background || 'transparent';
    const logo = document.createElement('img');
    logo.src = site.logo;
    logo.alt = '';
    logo.loading = 'lazy';
    logo.decoding = 'async';
    const name = document.createElement('span');
    name.className = 'website-name';
    name.textContent = site.name;
    wrap.append(logo);
    card.append(wrap, name, chevron());
    document.querySelector('#website-grid').append(card);
  });
  document.querySelector('.cv-button').href = data.resume;
  document.querySelector('.cv-button').download = data.resume.split('/').pop();
  document.querySelectorAll('.linkedin-link').forEach(link => { link.href = safeUrl(data.linkedin); });

  // A one-card step with wraparound works with any number of future projects.
  function moveSlider(direction) {
    if (!cards.length) return;
    const step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(slider).gap);
    const max = Math.max(0, slider.scrollWidth - slider.clientWidth);
    let target = slider.scrollLeft + direction * step;
    if (direction > 0 && slider.scrollLeft >= max - 2) target = 0;
    if (direction < 0 && slider.scrollLeft <= 2) target = max;
    slider.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }
  previous.addEventListener('click', () => moveSlider(-1));
  next.addEventListener('click', () => moveSlider(1));
  previous.disabled = next.disabled = !cards.length;
  slider.addEventListener('keydown', event => {
    if (event.target !== slider) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveSlider(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  // Native horizontal scrolling handles touch; enable dragging with a mouse too.
  let drag = null;
  let dragged = false;
  slider.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, scroll: slider.scrollLeft };
    dragged = false;
  });
  window.addEventListener('pointermove', event => {
    if (!drag) return;
    const distance = event.clientX - drag.x;
    if (Math.abs(distance) > 8) {
      dragged = true;
      slider.style.scrollSnapType = 'none';
      slider.scrollLeft = drag.scroll - distance;
    }
  });
  window.addEventListener('pointerup', () => {
    drag = null;
    slider.style.scrollSnapType = '';
  });
  window.addEventListener('pointercancel', () => { drag = null; slider.style.scrollSnapType = ''; });
  slider.addEventListener('click', event => {
    if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); dragged = false; }
  }, true);

  function showProject(index) {
    current = (index + data.projects.length) % data.projects.length;
    const project = data.projects[current];
    const imageUrl = project.fullImage || project.image;
    // Avoid briefly showing the previous image under the new title.
    largeImage.style.visibility = 'hidden';
    loading.hidden = false;
    largeImage.classList.remove('landscape');
    largeImage.src = imageUrl;
    largeImage.alt = `${project.name} — full project design`;
    document.querySelector('#lightbox-title').textContent = project.name;
    document.querySelector('#lightbox-description').textContent = project.description || '';
    document.querySelector('#lightbox-count').textContent = `${current + 1} / ${data.projects.length}`;
    const url = safeUrl(project.url);
    liveLink.hidden = !url;
    if (url) liveLink.href = url; else liveLink.removeAttribute('href');
    viewer.scrollTop = 0;
    viewer.scrollLeft = 0;
    // Warm the adjacent images for smooth navigation without loading every file.
    [-1, 1].forEach(offset => {
      const adjacent = data.projects[(current + offset + data.projects.length) % data.projects.length];
      const preload = new Image();
      preload.src = adjacent.fullImage || adjacent.image;
    });
  }
  largeImage.addEventListener('load', () => {
    loading.hidden = true;
    largeImage.classList.toggle('landscape', largeImage.naturalWidth >= largeImage.naturalHeight);
    largeImage.style.visibility = 'visible';
  });
  largeImage.addEventListener('error', () => {
    loading.hidden = true;
    largeImage.style.visibility = 'visible';
    document.querySelector('#lightbox-description').textContent = 'This project image could not be loaded.';
  });
  function openProject(index, source) {
    trigger = source;
    showProject(index);
    dialog.showModal();
    document.body.classList.add('lightbox-open');
    close.focus({ preventScroll: true });
  }
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    trigger?.focus({ preventScroll: true });
  });
  document.querySelector('#lightbox-previous').addEventListener('click', () => showProject(current - 1));
  document.querySelector('#lightbox-next').addEventListener('click', () => showProject(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showProject(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  // Native <dialog> provides Escape handling, focus containment and inert background.
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  viewer.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  viewer.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showProject(current + (dx < 0 ? 1 : -1));
  });
  viewer.addEventListener('pointercancel', () => { pointerStart = null; });
})();
