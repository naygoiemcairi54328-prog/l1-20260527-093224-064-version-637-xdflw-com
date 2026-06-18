(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        if (window.Hls) {
          resolve();
        }
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var input = document.getElementById('searchInput');
    var region = document.getElementById('regionFilter');
    var year = document.getElementById('yearFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    if (!cards.length || (!input && !region && !year)) {
      return;
    }
    function value(el) {
      return el ? String(el.value || '').trim().toLowerCase() : '';
    }
    function apply() {
      var keyword = value(input);
      var regionValue = value(region);
      var yearValue = value(year);
      cards.forEach(function (card) {
        var text = String(card.getAttribute('data-text') || '').toLowerCase();
        var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        card.classList.toggle('hide-card', !matched);
      });
    }
    [input, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  }

  function attachHls(video, src) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }
    return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js').then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = src;
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video[data-src]');
      var button = shell.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var initialized = false;
      function play() {
        var src = video.getAttribute('data-src');
        var start = initialized ? Promise.resolve() : attachHls(video, src);
        initialized = true;
        start.then(function () {
          shell.classList.add('playing');
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              shell.classList.remove('playing');
            });
          }
        }).catch(function () {
          video.src = src;
          shell.classList.add('playing');
          video.play();
        });
      }
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('playing');
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
