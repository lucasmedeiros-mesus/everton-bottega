/* Éverton Bottega — site.js: rolagem suave, reveal, parallax, scrub de texto, história fixa, tilt, magnético */
(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => [...r.querySelectorAll(s)];
  let lenis = null;

  /* ---------- rolagem suave (Lenis, opcional) ---------- */
  function startLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on('scroll', onScroll);
  }

  /* ---------- menu mobile ---------- */
  const burger = document.querySelector('.burger');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger && burger.setAttribute('aria-expanded', open);
    lenis && (open ? lenis.stop() : lenis.start());
    $('.menu .m').forEach((a, i) => (a.style.transitionDelay = open ? 120 + i * 60 + 'ms' : '0ms'));
  };
  burger && burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $('.menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- âncoras com rolagem suave ---------- */
  $('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- separa textos em palavras ---------- */
  $('[data-split]').forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) return frag.appendChild(document.createTextNode(' '));
            const w = document.createElement('span');
            w.className = 'w';
            const i = document.createElement('span');
            i.textContent = p;
            w.appendChild(i);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    $('.w > span', el).forEach((s, i) => s.style.setProperty('--i', i));
    if (el.dataset.base) el.style.setProperty('--base', el.dataset.base + 'ms');
  });

  /* ---------- scrub de palavras ---------- */
  const scrubs = $('[data-scrub]').map((el) => {
    const gold = (el.dataset.gold || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const text = el.textContent.trim();
    el.textContent = '';
    text.split(/\s+/).forEach((w, i, arr) => {
      const s = document.createElement('span');
      s.className = 'sw' + (gold.includes(w.toLowerCase().replace(/[^\p{L}]/gu, '')) ? ' g' : '');
      s.textContent = w + (i < arr.length - 1 ? ' ' : '');
      el.appendChild(s);
    });
    return { el, words: [...el.children] };
  });

  /* ---------- reveal ao entrar na tela ---------- */
  $('[data-stagger]').forEach((p) => {
    const step = +p.dataset.stagger || 90;
    [...p.children].forEach((c, i) => {
      if (!c.hasAttribute('data-r')) c.setAttribute('data-r', '');
      c.style.setProperty('--d', i * step + 'ms');
    });
  });
  // elementos com clip-path (mask) não disparam o observer: observa o pai e revela o filho
  const proxy = new Map();
  const reveal = (t) => {
    t.classList.add('in');
    if (t.hasAttribute('data-r')) setTimeout(() => t.classList.add('done'), 1700 + (parseInt(t.style.getPropertyValue('--d')) || 0));
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      (proxy.get(e.target) || [e.target]).forEach(reveal);
    }),
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  $('[data-r], [data-split]').forEach((el) => {
    if (el.dataset.d) el.style.setProperty('--d', el.dataset.d + 'ms');
    if (/^mask/.test(el.dataset.r || '') && el.parentElement) {
      const p = el.parentElement;
      proxy.set(p, [...(proxy.get(p) || []), el]);
      io.observe(p);
    } else io.observe(el);
  });

  /* ---------- contadores ---------- */
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
    const suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - k, 3));
      el.textContent = v.toFixed(dec).replace('.', ',') + suf;
      k < 1 && requestAnimationFrame(tick);
    };
    reduce ? (el.textContent = el.dataset.count.replace('.', ',') + suf) : requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $('[data-count]').forEach((el) => cio.observe(el));

  /* ---------- história fixa (troca de foto ao rolar) ---------- */
  const story = document.querySelector('.story');
  if (story) {
    const imgs = $('.story-media img', story), no = story.querySelector('.no'), steps = $('.step', story);
    const sio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = +e.target.dataset.step;
      steps.forEach((s) => s.classList.toggle('on', s === e.target));
      imgs.forEach((im, k) => im.classList.toggle('on', k === i));
      if (no) no.textContent = String(i + 1).padStart(2, '0');
    }), { rootMargin: '-40% 0px -40% 0px' });
    steps.forEach((s) => sio.observe(s));
    imgs[0] && imgs[0].classList.add('on');
    steps[0] && steps[0].classList.add('on');
  }

  /* ---------- loop de scroll: progresso, header, parallax, scrub ---------- */
  const bar = document.querySelector('.progress');
  const head = document.querySelector('header.top');
  const px = $('[data-parallax]');
  let lastY = 0, ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    const y = window.scrollY, vh = innerHeight;
    const max = doc.scrollHeight - vh;
    bar && bar.style.setProperty('--p', max > 0 ? y / max : 0);
    if (head) {
      head.classList.toggle('scrolled', y > 40);
      const down = y > lastY && y > 300 && !document.body.classList.contains('menu-open');
      head.classList.toggle('hide', down && y - lastY > 4);
      if (y < lastY) head.classList.remove('hide');
    }
    lastY = y;
    if (!reduce) {
      px.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const f = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -f).toFixed(1)}px, 0)`;
      });
      $('.frame img, .row .im img, .yt img').forEach((img) => {
        const r = img.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = `scale(1.1) translate3d(0, ${(p * -22).toFixed(1)}px, 0)`;
      });
    }
    scrubs.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.85 - vh * 0.25 + r.height * 0.6)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  /* ---------- hero: brilho que segue o cursor ---------- */
  const hero = document.querySelector('.hero');
  if (hero && fine && !reduce) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* ---------- tilt 3D nos cards + magnético nos botões ---------- */
  if (fine && !reduce) {
    $('.tilt').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
        c.style.setProperty('--rx', ((0.5 - y) * 9).toFixed(2) + 'deg');
        c.style.setProperty('--sx', (x * 100).toFixed(1) + '%');
        c.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
        c.classList.add('on');
      });
      c.addEventListener('pointerleave', () => c.classList.remove('on'));
    });
    $('.mag').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
      });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });
  }

  /* ---------- busca e filtro do blog ---------- */
  const q = document.querySelector('#q');
  if (q) {
    const cards = $('.post[data-t]'), empty = document.querySelector('.empty'), btns = $('.chips button');
    let cat = 'todos';
    const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const run = () => {
      const t = norm(q.value.trim());
      let n = 0;
      cards.forEach((c) => {
        const ok = (cat === 'todos' || c.dataset.c === cat) && norm(c.dataset.t).includes(t);
        c.classList.toggle('off', !ok);
        ok && n++;
      });
      empty && (empty.style.display = n ? 'none' : 'block');
    };
    q.addEventListener('input', run);
    btns.forEach((b) => b.addEventListener('click', () => {
      cat = b.dataset.c;
      btns.forEach((x) => x.classList.toggle('on', x === b));
      run();
    }));
  }

  /* ---------- formulário de contato -> WhatsApp ---------- */
  const form = document.querySelector('form.c');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const msg = `Olá, Éverton! Vim pelo site.%0A%0ANome: ${encodeURIComponent(d.nome || '')}%0AE-mail: ${encodeURIComponent(d.email || '')}%0ATelefone: ${encodeURIComponent(d.tel || '')}%0A%0A${encodeURIComponent(d.msg || '')}`;
      window.open(`https://wa.me/5551992828012?text=${msg}`, '_blank', 'noopener');
    });
  }

  /* ---------- saída suave entre páginas (onde não há View Transitions) ---------- */
  if (!('onpagereveal' in window) && !reduce) {
    $('a[href]').forEach((a) => {
      const h = a.getAttribute('href');
      if (!h || h.startsWith('#') || a.target === '_blank' || /^(https?:|mailto:|tel:)/.test(h)) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        document.body.classList.add('leaving');
        setTimeout(() => (location.href = a.href), 260);
      });
    });
    addEventListener('pageshow', () => document.body.classList.remove('leaving'));
  }

  /* ---------- carrega Lenis depois, sem bloquear ---------- */
  doc.classList.add('js');
  if (!reduce) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js';
    s.onload = startLenis;
    document.head.appendChild(s);
  }
})();
