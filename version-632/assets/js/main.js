(function() {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      const open = mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        setSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        setSlide(index + 1);
        start();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        setSlide(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  }

  const searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot) {
    const input = searchRoot.querySelector('[data-search-input]');
    const region = searchRoot.querySelector('[data-region-filter]');
    const year = searchRoot.querySelector('[data-year-filter]');
    const type = searchRoot.querySelector('[data-type-filter]');
    const cards = Array.from(document.querySelectorAll('[data-search-card]'));

    function norm(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      const q = norm(input && input.value);
      const r = norm(region && region.value);
      const y = norm(year && year.value);
      const t = norm(type && type.value);
      cards.forEach(function(card) {
        const haystack = norm([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        const okQuery = !q || haystack.includes(q);
        const okRegion = !r || norm(card.dataset.region) === r;
        const okYear = !y || norm(card.dataset.year) === y;
        const okType = !t || norm(card.dataset.type) === t;
        card.classList.toggle('is-hidden', !(okQuery && okRegion && okYear && okType));
      });
    }

    [input, region, year, type].forEach(function(el) {
      if (el) el.addEventListener('input', filterCards);
      if (el) el.addEventListener('change', filterCards);
    });
  }
})();
