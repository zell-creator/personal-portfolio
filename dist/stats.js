// Count visible totals once, sharing a single animation loop.
(() => {
  'use strict';

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const numbers = document.querySelectorAll('.strength-number');
  if (!numbers.length || motion.matches || !('IntersectionObserver' in window)) return;

  const active = new Map();
  let frame = null;
  let lastUpdate = 0;

  function update(timestamp) {
    frame = null;
    if (timestamp - lastUpdate >= 40 || motion.matches || document.hidden) {
      lastUpdate = timestamp;
      active.forEach((counter, element) => {
        const progress = motion.matches || document.hidden
          ? 1
          : Math.min((timestamp - counter.started) / 1200, 1);
        const value = Math.round(counter.target * (1 - Math.pow(1 - progress, 3))) + '+';
        if (element.textContent !== value) element.textContent = value;
        if (progress === 1) active.delete(element);
      });
    }
    if (active.size) frame = requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      observer.unobserve(element);
      if (motion.matches) return;
      const label = element.textContent.trim();
      element.setAttribute('aria-label', label);
      active.set(element, { target: Number(label.replace('+', '')), started: performance.now() });
      element.textContent = '0+';
    });
    if (active.size && frame === null) frame = requestAnimationFrame(update);
  }, { threshold: 0.5 });

  numbers.forEach(element => observer.observe(element));
})();
