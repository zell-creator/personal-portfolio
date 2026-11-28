// Reveal each experience total once it scrolls into view.
(() => {
  'use strict';

  const numbers = document.querySelectorAll('.strength-number');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!numbers.length || motion.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const element = entry.target;
      const target = Number(element.dataset.countTarget);
      const duration = 1400;
      let started;

      function count(timestamp) {
        if (started === undefined) started = timestamp;
        const progress = motion.matches ? 1 : Math.min((timestamp - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased) + '+';
        if (progress < 1) requestAnimationFrame(count);
      }

      requestAnimationFrame(count);
    });
  }, { threshold: 0.5 });

  numbers.forEach(element => {
    const label = element.textContent.trim();
    element.setAttribute('aria-label', label);
    element.dataset.countTarget = label.replace('+', '');
    element.textContent = '0+';
    observer.observe(element);
  });
})();
