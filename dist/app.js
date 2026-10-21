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
  const lightboxDots = document.querySelector('#lightbox-dots');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let trigger = null;
  let pointerStart = null;

  function renderLightboxDots() {
    const total = data.projects.length;
    const indexes = total <= 7
      ? Array.from({ length: total }, (_, index) => index)
      : Array.from({ length: 5 }, (_, offset) => (current - 2 + offset + total) % total);
    lightboxDots.replaceChildren(...indexes.map(index => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'lightbox-dot';
      dot.setAttribute('aria-label', `View project ${index + 1}: ${data.projects[index].name}`);
      if (index === current) dot.setAttribute('aria-current', 'true');
      dot.addEventListener('click', () => showProject(index));
      return dot;
    }));
  }

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

  const websites = Array.isArray(data.websites) ? data.websites : [];
  const websiteCount = document.querySelector('#website-count');
  const websiteTabs = document.querySelector('#website-tabs');
  const websiteScrollRegion = document.querySelector('#website-scroll-region');
  const websiteListColumn = document.querySelector('.website-list-column');
  const websitePreview = document.querySelector('#website-preview');
  const websitePreviewDomain = document.querySelector('#website-preview-domain');
  const websitePreviewMedia = document.querySelector('#website-preview-media');
  const websitePreviewPlaceholder = document.querySelector('#website-preview-placeholder');
  const websitePlaceholderDomain = document.querySelector('#website-placeholder-domain');
  const websiteEmpty = document.querySelector('#website-empty');
  const mobileWebsiteLayout = window.matchMedia('(max-width: 800px)');
  let selectedWebsiteId = websites.length ? websiteId(websites[0]) : null;

  function updateWebsiteListFade() {
    if (!websiteListColumn || !websiteScrollRegion) return;
    const hasMoreTabs = websiteScrollRegion.scrollHeight > websiteScrollRegion.clientHeight + 1;
    const atListEnd = websiteScrollRegion.scrollTop + websiteScrollRegion.clientHeight >= websiteScrollRegion.scrollHeight - 1;
    websiteListColumn.classList.toggle('has-more-tabs', hasMoreTabs);
    websiteListColumn.classList.toggle('at-list-end', !hasMoreTabs || atListEnd);
  }

  function syncWebsiteTabsToPreview() {
    if (!websiteListColumn) return;

    if (mobileWebsiteLayout.matches) {
      const contentHeight = websiteTabs.scrollHeight;
      const mobileMaxHeight = Math.min(480, window.innerHeight * 0.65);
      websiteListColumn.style.height = `${Math.min(contentHeight, mobileMaxHeight)}px`;
      requestAnimationFrame(updateWebsiteListFade);
      return;
    }

    const availableHeight = websitePreview.getBoundingClientRect().height;
    if (!availableHeight || !websiteTabs.children.length) return;
    websiteListColumn.style.height = `${availableHeight}px`;
    requestAnimationFrame(updateWebsiteListFade);
  }

  const scheduleWebsiteTabsSync = () => requestAnimationFrame(syncWebsiteTabsToPreview);
  if ('ResizeObserver' in window) {
    const websiteLayoutObserver = new ResizeObserver(scheduleWebsiteTabsSync);
    websiteLayoutObserver.observe(websitePreview);
    websiteLayoutObserver.observe(websiteTabs);
  }
  window.addEventListener('resize', scheduleWebsiteTabsSync, { passive: true });
  websiteScrollRegion?.addEventListener('scroll', updateWebsiteListFade, { passive: true });

  function websiteId(site) {
    return String(site.id || site.url || site.name || '');
  }
  function websiteDomId(siteId) {
    return siteId.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '');
  }
  function websiteUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  function selectedWebsite() {
    return websites.find(site => websiteId(site) === selectedWebsiteId) || null;
  }
  function showWebsitePreview(site) {
    websitePreviewMedia.replaceChildren();
    websitePreviewMedia.hidden = true;
    websitePreviewDomain.textContent = '';
    websitePreviewPlaceholder.hidden = true;
    websitePreview.setAttribute('aria-label', site ? `Preview of ${site.name}` : 'No live website preview');

    if (!site) {
      websitePreview.removeAttribute('aria-labelledby');
      websitePreviewPlaceholder.hidden = false;
      websitePlaceholderDomain.textContent = '';
      return;
    }

    const safeUrl = websiteUrl(site.url);
    let domain = site.name;
    if (safeUrl) {
      try { domain = new URL(safeUrl).hostname.replace(/^www\./, ''); } catch { /* use project name */ }
    }
    websitePreviewDomain.textContent = domain;
    websitePlaceholderDomain.textContent = domain;
    websitePreview.setAttribute('aria-labelledby', `website-tab-${websiteDomId(websiteId(site))}`);

    if (!site.previewImage) {
      websitePreviewPlaceholder.hidden = false;
      return;
    }

    const image = document.createElement('img');
    image.src = site.previewImage;
    image.alt = site.previewAlt || `Website preview for ${site.name}`;
    image.decoding = 'async';
    image.loading = 'eager';
    image.addEventListener('error', () => {
      image.remove();
      websitePreviewMedia.hidden = true;
      websitePreviewPlaceholder.hidden = false;
      scheduleWebsiteTabsSync();
    }, { once: true });
    image.addEventListener('load', scheduleWebsiteTabsSync, { once: true });
    websitePreviewMedia.hidden = false;
    websitePreviewMedia.append(image);
  }
  function renderWebsiteTabs(focusId = null) {
    websiteTabs.replaceChildren();
    websiteCount.textContent = String(websites.length);
    websiteEmpty.hidden = websites.length > 0;
    if (!websites.some(site => websiteId(site) === selectedWebsiteId)) {
      selectedWebsiteId = websites.length ? websiteId(websites[0]) : null;
    }

    websites.forEach((site, index) => {
      const id = websiteId(site);
      const domId = websiteDomId(id);
      const selected = id === selectedWebsiteId;
      const item = document.createElement('div');
      item.className = `website-item${selected ? ' is-active' : ''}`;
      item.setAttribute('role', 'presentation');

      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'website-tab';
      tab.id = `website-tab-${domId}`;
      tab.dataset.websiteId = id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('aria-controls', `website-preview website-details-${domId}`);
      tab.setAttribute('aria-expanded', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.append(Object.assign(document.createElement('span'), {
        className: 'website-tab-number',
        textContent: String(index + 1).padStart(2, '0'),
      }));

      const logoWrap = document.createElement('span');
      logoWrap.className = 'website-tab-logo';
      logoWrap.style.backgroundColor = site.background || '#fff';
      if (site.logo) {
        const logo = document.createElement('img');
        logo.src = site.logo;
        logo.alt = '';
        logo.loading = 'lazy';
        logo.decoding = 'async';
        logo.addEventListener('error', () => logo.remove(), { once: true });
        logoWrap.append(logo);
      }
      const name = document.createElement('span');
      name.className = 'website-tab-name';
      name.textContent = site.name;
      const description = document.createElement('span');
      description.className = 'website-tab-description';
      description.textContent = site.description || '';
      const toggle = document.createElement('span');
      toggle.className = 'website-tab-toggle';
      toggle.setAttribute('aria-hidden', 'true');
      toggle.textContent = selected ? '−' : '+';
      tab.append(logoWrap, name, description, toggle);

      const details = document.createElement('div');
      details.className = 'website-item-details';
      details.id = `website-details-${domId}`;
      details.hidden = !selected;
      const url = websiteUrl(site.url);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'View Website';
        link.setAttribute('aria-label', `View ${site.name} (opens in a new tab)`);
        details.append(link);
      }
      details.hidden = !selected || !details.childElementCount;

      tab.addEventListener('click', () => selectWebsite(id));
      tab.addEventListener('keydown', event => {
        const currentIndex = websites.findIndex(item => websiteId(item) === id);
        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % websites.length;
        else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + websites.length) % websites.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = websites.length - 1;
        else return;
        event.preventDefault();
        selectWebsite(websiteId(websites[nextIndex]), true);
      });
      item.append(tab, details);
      websiteTabs.append(item);
    });

    showWebsitePreview(selectedWebsite());
    scheduleWebsiteTabsSync();
    if (focusId) {
      const focusTab = document.querySelector(`#website-tab-${websiteDomId(focusId)}`);
      focusTab?.focus();
      focusTab?.scrollIntoView({ block: 'nearest' });
    }
  }
  function selectWebsite(id, moveFocus = false) {
    if (!websites.some(site => websiteId(site) === id)) return;
    selectedWebsiteId = id;
    renderWebsiteTabs(moveFocus ? id : null);
  }
  renderWebsiteTabs();
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
    renderLightboxDots();
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
