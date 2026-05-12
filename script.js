/* ===================================================
   CHEF GABE — script.js
   =================================================== */

// --- Mobile nav toggle ---
(function () {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    }
  });
})();

// --- Lazy image loading ---
(function () {
  if ('IntersectionObserver' in window) {
    const imgs = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach((img) => observer.observe(img));
  } else {
    // Fallback: load all immediately
    document.querySelectorAll('img[data-src]').forEach((img) => {
      img.src = img.dataset.src;
    });
  }
})();

// --- Recipe filter buttons (recipes index page) ---
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.recipe-card[data-category]');
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach((card) => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

// --- Smooth scroll for jump-to-recipe links ---
(function () {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // header height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

// --- Scroll-reveal animation ---
(function () {
  if (!('IntersectionObserver' in window)) return;
  const style = document.createElement('style');
  style.textContent = `.reveal{opacity:0;transform:translateY(24px);transition:opacity .55s ease,transform .55s ease}.reveal.visible{opacity:1;transform:none}`;
  document.head.appendChild(style);

  const targets = document.querySelectorAll('.recipe-card, .featured-recipe, .category-card, .recipe-card-box');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();

// --- Newsletter form (basic) ---
(function () {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && input.value) {
      form.innerHTML = '<p style="color:#fff;font-size:1rem;font-weight:600;">Thanks! You\'re on the list.</p>';
    }
  });
})();

// --- Print recipe button ---
(function () {
  const printBtn = document.querySelector('.js-print');
  if (!printBtn) return;
  printBtn.addEventListener('click', () => window.print());
})();
