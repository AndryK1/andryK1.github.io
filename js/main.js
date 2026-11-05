/*
 * Портфолио Андрея Хлоповских — поведение страницы.
 *
 * Модули (каждый — отдельная функция init*):
 *   initSpace       — звёзды и мерцание фона
 *   initLiteMode    — облегчённый фон на слабых устройствах
 *   initMarquee     — бесконечная бегущая строка
 *   initTypewriter  — печатающаяся строка навыков в hero
 *   initSections    — раскрытие разделов на «пути»
 *   initJourneyPath — дорожка: одна непрерывная кривая от точки к точке
 *   initProjects    — орбиты с приложениями и карточка проекта
 *   initDocs        — сертификат и справка
 *   Lightbox        — полноэкранный просмотр со свайпом
 *   initCursor      — курсор-комета
 *   initOffscreenPause — пауза бесконечных анимаций вне экрана
 *   initFrameGuard  — облегчённый фон, если графика не тянет плавную анимацию
 *
 * Принципы производительности:
 *   - каждый кадр двигаем только transform/opacity;
 *   - никаких перерисовок всей страницы: меняем классы и отдельные узлы;
 *   - цикл requestAnimationFrame курсора сам засыпает, когда всё замерло.
 */
(function () {
  'use strict';

  const page = document.getElementById('page');
  const PROJECTS = window.PROJECTS || [];
  const DOCS = window.DOCS || [];

  /* ---------- маленькие помощники ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const prefersReducedMotion = () => {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  };

  const ICONS = {
    close: (size) => `<svg width="${size || 18}" height="${size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>`,
    arrowUpRight: (size, width) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>`,
    expand: (size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>`,
    arrowLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg>',
    arrowRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
    chevronLeft: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    chevronRight: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
  };

  /* =======================================================================
     ФОН: звёзды и мерцание
     Каждый слой звёзд — повторяющаяся плитка (500/700/900 px), которая медленно
     едет вверх. Плитку один раз рисуем на <canvas> и отдаём слою как обычную
     картинку: когда слой сдвигается и браузеру нужно дорисовать новый кусок,
     он просто копирует готовую картинку, а не пересчитывает десятки градиентов.
     Это главная экономия кадров на слабых видеокартах.
     Генератор детерминированный, поэтому небо всегда одинаковое.
     ======================================================================= */
  function initSpace() {
    let seed = 20051005;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

    const starLayer = (tile, count, minSize, maxSize, minAlpha, maxAlpha, mintShare) => {
      const stars = [];
      for (let k = 0; k < count; k++) {
        const x = Math.round(rnd() * tile);
        const y = Math.round(rnd() * tile);
        const size = Number((minSize + rnd() * (maxSize - minSize)).toFixed(1));
        const alpha = (minAlpha + rnd() * (maxAlpha - minAlpha)).toFixed(2);
        const color = rnd() < mintShare ? '190,255,228' : '255,255,255';
        stars.push({ x, y, size, alpha, color });
      }
      return { tile, stars };
    };

    // запасной вариант (и первый кадр до готовности картинки): те же звёзды CSS-градиентами
    const asGradients = (layer) => layer.stars.map((s) =>
      `radial-gradient(${s.size}px ${s.size}px at ${s.x}px ${s.y}px, rgba(${s.color},${s.alpha}), transparent)`
    ).join(', ');

    // та же плитка, нарисованная один раз на canvas с учётом плотности пикселей экрана
    const paintTile = (layer, el) => {
      try {
        const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = Math.round(layer.tile * dpr);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        // в CSS первый градиент лежит сверху, поэтому рисуем с конца
        for (let i = layer.stars.length - 1; i >= 0; i--) {
          const s = layer.stars[i];
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
          g.addColorStop(0, `rgba(${s.color},${s.alpha})`);
          g.addColorStop(1, `rgba(${s.color},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(s.x - s.size, s.y - s.size, s.size * 2, s.size * 2);
        }
        canvas.toBlob((blob) => {
          if (blob) el.style.backgroundImage = `url(${URL.createObjectURL(blob)})`;
        });
      } catch (e) { /* остаются CSS-градиенты */ }
    };

    // порядок вызовов rnd() важен: он задаёт расположение звёзд
    const twinkles = [];
    for (let k = 0; k < 16; k++) {
      twinkles.push({
        x: (rnd() * 100).toFixed(2) + '%',
        y: (rnd() * 100).toFixed(2) + '%',
        size: (5 + rnd() * 3).toFixed(1) + 'px',
        duration: (2.5 + rnd() * 4).toFixed(2) + 's',
        delay: (-rnd() * 6).toFixed(2) + 's'
      });
    }
    const layers = {
      a: starLayer(500, 34, 1.2, 2, 0.25, 0.6, 0.15),
      b: starLayer(700, 20, 1.8, 2.8, 0.35, 0.8, 0.3),
      c: starLayer(900, 9, 2.6, 3.8, 0.5, 0.9, 0.5)
    };

    $$('[data-stars]').forEach((el) => {
      const layer = layers[el.dataset.stars];
      el.style.backgroundImage = asGradients(layer);
      paintTile(layer, el);
    });

    const wrap = document.getElementById('twinkles');
    wrap.innerHTML = twinkles.map((t) =>
      `<span class="tw" style="left:${t.x};top:${t.y};width:${t.size};height:${t.size};animation-duration:${t.duration};animation-delay:${t.delay}"></span>`
    ).join('');
  }

  /* на слабых машинах (мало ядер или памяти) фон становится спокойнее */
  function initLiteMode() {
    try {
      const cores = navigator.hardwareConcurrency || 8;
      const memory = navigator.deviceMemory || 8;
      if (cores <= 4 || memory <= 4) page.classList.add('lite');
    } catch (e) { /* ignore */ }
  }

  /* Страховка для слабой графики: если первые секунды страница стабильно не
     вытягивает плавную анимацию (меньше ~40 кадров/с), включаем тот же
     облегчённый фон, что и для слабых устройств. На нормальном железе
     ничего не меняется. */
  function initFrameGuard() {
    if (page.classList.contains('lite') || window.__noFrameGuard || prefersReducedMotion()) return;
    let slowWindows = 0;
    let checks = 0;
    const measure = () => {
      if (document.visibilityState !== 'visible') return setTimeout(measure, 1000);
      let frames = 0;
      const start = performance.now();
      const tick = (now) => {
        frames++;
        if (now - start < 2000) return requestAnimationFrame(tick);
        const fps = frames * 1000 / (now - start);
        slowWindows = fps < 40 ? slowWindows + 1 : 0;
        checks++;
        if (slowWindows >= 2) page.classList.add('lite');
        else if (checks < 5) setTimeout(measure, 500);
      };
      requestAnimationFrame(tick);
    };
    setTimeout(measure, 2500); // после стартовых анимаций и загрузки картинок
  }

  /* =======================================================================
     БЕГУЩАЯ СТРОКА: список навыков, повторённый дважды, едет на -50%
     ======================================================================= */
  function initMarquee() {
    const skills = ['Kotlin', 'Jetpack Compose', 'Coroutines', 'Flow', 'StateFlow', 'Room', 'Paging 3', 'Retrofit2', 'OkHttp', 'MVVM', 'Clean Architecture', 'Koin', 'Dagger 2', 'Material3', 'Git'];
    const item = (s) => `<span class="marquee__item"><span>${esc(s)}</span><span class="marquee__dot"></span></span>`;
    document.getElementById('marquee').innerHTML = skills.concat(skills).map(item).join('');
  }

  /* =======================================================================
     ПЕЧАТНАЯ МАШИНКА: пишет прямо в один текстовый узел
     ======================================================================= */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const pairs = ['Kotlin · Jetpack Compose', 'Coroutines · Flow', 'Room · Paging 3', 'Retrofit · OkHttp', 'MVVM · Clean Architecture', 'Koin · Dagger 2'];
    const reduce = prefersReducedMotion();
    let pair = 0;
    let chars = 0;
    let erasing = false;

    const step = () => {
      const word = pairs[pair];
      if (reduce) {
        el.textContent = word;
        pair = (pair + 1) % pairs.length;
        return setTimeout(step, 2800);
      }
      if (!erasing) {
        chars++;
        el.textContent = word.slice(0, chars);
        if (chars >= word.length) { erasing = true; return setTimeout(step, 1800); }
        return setTimeout(step, 55 + Math.random() * 50);
      }
      chars--;
      el.textContent = word.slice(0, chars);
      if (chars <= 0) { erasing = false; pair = (pair + 1) % pairs.length; return setTimeout(step, 400); }
      return setTimeout(step, 28);
    };
    setTimeout(step, 1200);
  }

  /* =======================================================================
     РАЗДЕЛЫ НА ПУТИ: клик по карточке раскрывает панель под ней
     ======================================================================= */
  const sectionListeners = [];
  function setSectionOpen(section, open) {
    section.classList.toggle('is-open', open);
    const head = $('.jr-head', section);
    if (head) head.setAttribute('aria-expanded', open ? 'true' : 'false');
    sectionListeners.forEach((fn) => fn(section.id, open));
  }

  function initSections() {
    $$('[data-toggle-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const section = btn.closest('.jr');
        setSectionOpen(section, !section.classList.contains('is-open'));
      });
    });
    // ссылки «Обо мне», «Проекты» и т.д. открывают раздел, а браузер прокручивает к нему
    $$('[data-open-section]').forEach((link) => {
      link.addEventListener('click', () => {
        const section = document.getElementById(link.dataset.openSection);
        if (section) setSectionOpen(section, true);
      });
    });
  }

  /* =======================================================================
     ДОРОЖКА: одна SVG-кривая через весь путь
     Кривая строится по реальному положению точек: стартовая точка → 01 → … → 05 →
     точка контактов. Каждый кусок между двумя точками — одна непрерывная линия,
     поэтому склеек нет (концы кусков спрятаны под кружками). При любом изменении
     размеров (раскрыли раздел, догрузились шрифты, поменялась ширина окна)
     кривая перестраивается. Когда раздел раскрывается, прямой участок под его
     карточкой плавно «дорастает» вниз — его прячет полоска в маске, которая
     за 1 с съезжает вниз.
     ======================================================================= */
  function initJourneyPath() {
    const main = document.getElementById('journey');
    const svg = document.getElementById('journey-path');
    if (!main || !svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const sections = $$('.jr', main).filter((el) => !el.classList.contains('contact'));
    const startDot = $('.jr-startdot', main);
    const endDot = $('#contact .jr-tail__dot', main);
    const curtain = $('.jr-curtain', svg);
    const reduce = prefersReducedMotion();

    // по паре путей (свечение + линия) на каждый кусок между точками
    const segs = [];
    for (let i = 0; i <= sections.length; i++) {
      const glow = document.createElementNS(NS, 'path');
      const line = document.createElementNS(NS, 'path');
      glow.setAttribute('class', 'jr-path-glow');
      line.setAttribute('class', 'jr-path-line');
      svg.append(glow, line);
      segs.push({ glow, line });
    }

    const ease = cubicBezier(0.2, 0.8, 0.2, 1);
    let growId = null;
    let growRaf = 0;

    function draw() {
      const mr = main.getBoundingClientRect();
      const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - mr.left, t: r.top - mr.top, w: r.width, h: r.height }; };
      const f = (n) => n.toFixed(2);
      const pt = (x, y) => f(x) + ',' + f(y);
      const rows = sections.map((sec) => Object.assign(box($('.jr-track', sec)), { right: sec.classList.contains('jr--right') }));
      const sb = box(startDot);
      const eb = box(endDot);
      const cx = rows[0].l + rows[0].w / 2;

      const paths = [];
      let d = 'M' + pt(cx, sb.t + sb.h / 2);
      rows.forEach((r) => {
        const x = r.l + r.w / 2;
        const dx = r.l + r.w * (r.right ? 114 : 26) / 140;   // точка стоит на 81.43% / 18.57% ширины дорожки
        d += ' L' + pt(x, r.t);                                // прямо вниз до верха строки (сквозь открытую панель)
        d += ' C' + pt(x, r.t + 0.3 * r.h) + ' ' + pt(dx, r.t + 0.2 * r.h) + ' ' + pt(dx, r.t + 0.5 * r.h);
        paths.push(d);
        d = 'M' + pt(dx, r.t + 0.5 * r.h) + ' C' + pt(dx, r.t + 0.8 * r.h) + ' ' + pt(x, r.t + 0.7 * r.h) + ' ' + pt(x, r.t + r.h);
      });
      d += ' L' + pt(cx, eb.t + eb.h / 2);
      paths.push(d);
      paths.forEach((pd, i) => { segs[i].glow.setAttribute('d', pd); segs[i].line.setAttribute('d', pd); });

      // только что раскрытый раздел: новый прямой участок дорастает сверху вниз
      if (!growId) return;
      const k = sections.findIndex((sec) => sec.id === growId);
      growId = null;
      if (k < 0 || reduce) return;
      const r = rows[k];
      const y0 = r.t + r.h;
      const y1 = rows[k + 1] ? rows[k + 1].t : eb.t + eb.h / 2;
      const gap = y1 - y0;
      if (gap < 2) return;
      curtain.setAttribute('x', f(r.l + r.w / 2 - 12));
      curtain.setAttribute('width', '24');
      curtain.setAttribute('y', f(y0));
      curtain.setAttribute('height', f(gap));
      segs.forEach((sg) => { sg.glow.removeAttribute('mask'); sg.line.removeAttribute('mask'); });
      const seg = segs[k + 1];
      seg.glow.setAttribute('mask', 'url(#jr-grow)');
      seg.line.setAttribute('mask', 'url(#jr-grow)');
      const t0 = performance.now();
      cancelAnimationFrame(growRaf);
      const step = (now) => {
        const p = ease(Math.min(1, (now - t0) / 1000));
        curtain.setAttribute('y', f(y0 + gap * p));
        curtain.setAttribute('height', f(gap * (1 - p)));
        if (p < 1) { growRaf = requestAnimationFrame(step); return; }
        seg.glow.removeAttribute('mask');
        seg.line.removeAttribute('mask');
      };
      growRaf = requestAnimationFrame(step);
    }

    sectionListeners.push((id, open) => { if (open) growId = id; });
    try { new ResizeObserver(draw).observe(main); } catch (e) { /* ignore */ }
    window.addEventListener('resize', draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    draw();
  }

  /* та же кривая скорости, что у CSS cubic-bezier(), но как функция времени 0..1 */
  function cubicBezier(x1, y1, x2, y2) {
    const A = (a, b) => 1 - 3 * b + 3 * a;
    const B = (a, b) => 3 * b - 6 * a;
    const C = (a) => 3 * a;
    const at = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
    const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const dx = at(t, x1, x2) - x;
        const dd = slope(t, x1, x2);
        if (Math.abs(dx) < 1e-5 || !dd) break;
        t -= dx / dd;
      }
      return at(Math.min(1, Math.max(0, t)), y1, y2);
    };
  }

  /* =======================================================================
     ПРОЕКТЫ: иконки на двух орбитах + карточка выбранного проекта
     ======================================================================= */
  function initProjects() {
    const orbit = document.getElementById('orbit');
    const slot = document.getElementById('project-slot');
    if (!orbit || !slot) return;
    let selected = null;
    let card = null;

    const iconBackground = (p) => p.wip
      ? 'radial-gradient(circle at 35% 30%, rgba(127,255,212,.16), rgba(127,255,212,.05) 60%, rgba(10,21,18,.35) 100%)'
      : `radial-gradient(circle at 32% 28%, ${p.hue}cc, ${p.hue}40 60%, #0B1A16 100%)`;
    const mark = (p) => (p.wip ? '?' : p.num);

    /* --- орбиты --- */
    const orbitButton = (p, index, angle, ringName) => `
      <div class="orbit-slot" style="--a: ${angle}deg">
        <div class="orbit-up up-${ringName}">
          <button class="orbit-btn${p.wip ? ' wip' : ''}" data-project="${index}" aria-pressed="false"
                  aria-label="${p.wip ? 'Открыть: приложение в разработке' : 'Открыть описание: ' + esc(p.title)}">
            <span class="orbit-icon" style="background: ${iconBackground(p)}">
              ${p.icon ? `<img class="orbit-img" src="${esc(p.icon)}" alt="" decoding="async">` : `<span class="disp orbit-num">${esc(mark(p))}</span>`}
              <span class="orbit-badge">${ICONS.arrowUpRight(12, 3)}</span>
            </span>
            <span class="orbit-name">${esc(p.orbitName || p.title)}</span>
          </button>
        </div>
      </div>`;

    const inner = PROJECTS.slice(0, 3).map((p, k) => orbitButton(p, k, k * 120 - 90, 'a')).join('');
    const outer = PROJECTS.slice(3).map((p, k) => orbitButton(p, k + 3, k * 120 - 30, 'b')).join('');
    orbit.insertAdjacentHTML('beforeend',
      `<div class="orbit-ring ring-a">${inner}</div><div class="orbit-ring ring-b">${outer}</div>`);
    const buttons = $$('.orbit-btn', orbit);

    // орбита, на иконке которой курсор, замирает; с клавиатуры — замирают обе
    buttons.forEach((btn) => {
      const ring = btn.closest('.orbit-ring');
      btn.addEventListener('pointerenter', () => ring.classList.add('is-held'));
      btn.addEventListener('pointerleave', () => ring.classList.remove('is-held'));
      btn.addEventListener('click', () => select(selected === Number(btn.dataset.project) ? null : Number(btn.dataset.project)));
    });
    orbit.addEventListener('focusin', (e) => {
      let visible = false;
      try { visible = e.target.matches(':focus-visible'); } catch (err) { /* ignore */ }
      orbit.classList.toggle('is-focused', visible);
    });
    orbit.addEventListener('focusout', () => orbit.classList.remove('is-focused'));

    // крутятся только пока раздел открыт
    sectionListeners.push((id, open) => { if (id === 'projects') orbit.classList.toggle('is-running', open); });

    /* --- карточка проекта --- */
    const list = (items) => items.map((t) => `<li class="feat"><span>${esc(t)}</span></li>`).join('');

    const placeholderShots = (p) => {
      const tint = p.hue + '24';
      const shot = (n, d, y, r, w, maxW, radius, extra) => `<div class="shot hatch" style="--d: ${d}s; --y: ${y}px; --r: ${r}deg; width: ${w}; max-width: ${maxW}px; border-radius: ${radius}px; background-color: ${tint}; ${extra}"><span class="mono">[экран ${n}]</span></div>`;
      return `<div class="shot-placeholders">
        ${shot(1, .1, 24, -4, '30%', 140, 22, 'border: 1px solid rgba(255,255,255,.1)')}
        ${shot(2, .2, 0, 0, '34%', 160, 24, 'border: 1px solid color-mix(in oklab, var(--accent) 35%, transparent); box-shadow: 0 30px 60px -24px rgba(0,0,0,.9)')}
        ${shot(3, .3, 24, 4, '30%', 140, 22, 'border: 1px solid rgba(255,255,255,.1)')}
      </div>`;
    };

    const shotsStrip = (p) => `
      <div class="shots">
        <span class="shots__head"><span class="shots__count mono">ЭКРАНЫ · ${p.shots.length}</span><span class="shots__hint mono">листайте вбок → нажмите, чтобы открыть на весь экран</span></span>
        <div class="shots-strip">
          ${p.shots.map((s, i) => `
            <figure class="shot-fig">
              <button class="shot-btn" data-shot="${i}" aria-label="Открыть на весь экран: ${esc(s.cap)}">
                <img class="shot-img" src="${esc(s.thumb)}" alt="${esc(s.alt)}" loading="lazy" decoding="async" width="420" height="910">
                <span class="shot-zoom" aria-hidden="true">${ICONS.expand(15)}</span>
              </button>
              <figcaption>${esc(s.cap)}</figcaption>
            </figure>`).join('')}
        </div>
      </div>`;

    const doneBody = (p) => {
      const hasShots = p.shots && p.shots.length;
      return `
      <div class="project__done">
        <div class="project__cols">
          <div class="project__info">
            <div class="facts">
              <div class="fact"><span class="fact__k mono">РОЛЬ</span><span class="fact__v">${esc(p.role || '[Роль]')}</span></div>
              <div class="fact"><span class="fact__k mono">МОЯ ЧАСТЬ</span><span class="fact__v">${esc(p.part || '[Что делал сам]')}</span></div>
              <div class="fact"><span class="fact__k mono">СРОК</span><span class="fact__v">${esc(p.time || '[Сроки]')}</span></div>
              <div class="fact"><span class="fact__k mono">СТЕК</span><span class="fact__v">${esc(p.stack)}</span></div>
            </div>
            <div class="project__block">
              <span class="project__label mono">О ПРИЛОЖЕНИИ</span>
              <p class="project__about">${esc(p.about || '[Что за приложение, для кого и какую проблему решает — 2–3 предложения.]')}</p>
            </div>
            <div class="project__block project__block--list">
              <span class="project__label mono">ВОЗМОЖНОСТИ</span>
              <ul class="feat-grid">${list(p.features || ['[Возможность 1]', '[Возможность 2]', '[Возможность 3]'])}</ul>
            </div>
            <div class="project__block">
              <span class="project__label mono">ПОД КАПОТОМ</span>
              <ul class="feat-grid">${list(p.tech || ['[Стек и архитектура: что использовал и почему]'])}</ul>
            </div>
            <div class="project__links">
              <a class="btn btn-glow project__repo" href="${esc(p.repo || 'https://github.com/AndryK1')}" target="_blank" rel="noopener noreferrer">
                ${esc(p.repoLabel || 'Код на GitHub')}
                ${ICONS.arrowUpRight(16, 2.2)}
              </a>
            </div>
          </div>
          ${hasShots ? '' : placeholderShots(p)}
        </div>
        ${hasShots ? shotsStrip(p) : ''}
      </div>`;
    };

    const cardHtml = (p) => `
      <div class="project__head">
        <span class="project__icon disp" style="background: ${iconBackground(p)}">${p.icon ? `<img src="${esc(p.icon)}" alt="" decoding="async">` : esc(mark(p))}</span>
        <div class="project__titles">
          <span class="project__kicker mono">ПРОЕКТ ${esc(p.num)} · ${esc(p.kind)}</span>
          <h3 class="project__title disp">${esc(p.title)}</h3>
        </div>
        <button class="round-btn project__close" data-close-project aria-label="Скрыть описание проекта">${ICONS.close(18)}</button>
      </div>
      ${p.wip
        ? '<p class="project__wip">В данный момент в разработке. Описание, экраны и ссылка на код появятся здесь, когда приложение будет готово.</p>'
        : doneBody(p)}`;

    function select(index) {
      selected = index;
      buttons.forEach((b) => {
        const on = Number(b.dataset.project) === index;
        b.classList.toggle('sel', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (index === null) {
        slot.innerHTML = '';
        card = null;
        return;
      }
      if (!card) {
        // новая карточка проявляется анимацией .doc-view; при смене проекта
        // меняется только содержимое, сама карточка остаётся на месте
        card = document.createElement('div');
        card.id = 'project-details';
        card.className = 'project doc-view';
        slot.appendChild(card);
      }
      card.innerHTML = cardHtml(PROJECTS[index]);
      try { card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { /* ignore */ }
    }

    slot.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-project]')) return select(null);
      const shot = e.target.closest('[data-shot]');
      if (shot && selected !== null) {
        const p = PROJECTS[selected];
        Lightbox.open(p.shots.map((s) => ({ src: s.full || s.thumb, alt: s.alt, cap: s.cap })), Number(shot.dataset.shot));
      }
    });
  }

  /* =======================================================================
     ДОКУМЕНТЫ: сертификат и справка (3 страницы)
     ======================================================================= */
  function initDocs() {
    const slot = document.getElementById('doc-slot');
    if (!slot) return;
    const cert = DOCS[0];
    const pages = DOCS.slice(1);
    let doc = null;      // null | 'cert' | 'ref'
    let refPage = 0;
    let viewer = null;

    const render = () => {
      if (!doc) {
        slot.innerHTML = '';
        viewer = null;
        return;
      }
      if (!viewer) {
        viewer = document.createElement('div');
        viewer.className = 'doc-viewer doc-view';
        slot.appendChild(viewer);
      }
      const isRef = doc === 'ref';
      const image = isRef ? pages[refPage] : cert;
      const alt = isRef
        ? 'Справка Яндекс Практикума об обучении, страница ' + (refPage + 1)
        : 'Сертификат Яндекс Практикума «Android-разработчик расширенный»';
      viewer.innerHTML = `
        <div class="doc-viewer__bar">
          <div class="doc-viewer__tabs">
            <button class="doc-tab" data-doc="cert" aria-pressed="${!isRef}">Сертификат</button>
            <button class="doc-tab" data-doc="ref" aria-pressed="${isRef}">Справка</button>
          </div>
          <div class="doc-viewer__tools">
            ${isRef ? `
              <button class="round-btn" data-ref-step="-1" aria-label="Предыдущая страница">${ICONS.arrowLeft}</button>
              <span class="doc-viewer__page mono">${refPage + 1} / ${pages.length}</span>
              <button class="round-btn" data-ref-step="1" aria-label="Следующая страница">${ICONS.arrowRight}</button>` : ''}
            <button class="btn-glow doc-viewer__full" data-doc-full>На весь экран${ICONS.expand(14)}</button>
            <button class="round-btn" data-doc-close aria-label="Скрыть документ">${ICONS.close(18)}</button>
          </div>
        </div>
        <img class="doc-viewer__img${isRef ? ' doc-viewer__img--page' : ''}" src="${esc(image.src)}" alt="${esc(alt)}" decoding="async">`;
    };

    const show = (which) => {
      if (which === 'ref' && doc !== 'ref') refPage = 0;
      doc = which;
      render();
    };

    // миниатюры в карточке курса
    $$('.doc-thumb[data-doc]').forEach((b) => b.addEventListener('click', () => show(b.dataset.doc)));

    slot.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-doc]');
      if (tab) return show(tab.dataset.doc);
      const step = e.target.closest('[data-ref-step]');
      if (step) {
        refPage = (refPage + Number(step.dataset.refStep) + pages.length) % pages.length;
        return render();
      }
      if (e.target.closest('[data-doc-close]')) { doc = null; return render(); }
      if (e.target.closest('[data-doc-full]')) {
        Lightbox.open(DOCS, doc === 'ref' ? 1 + refPage : 0, 'Документы');
      }
    });
  }

  /* =======================================================================
     ПОЛНОЭКРАННЫЙ ПРОСМОТР: свайп/перетаскивание двигают ленту прямо в DOM,
     без перерисовки на каждое движение
     ======================================================================= */
  const Lightbox = (function () {
    let root = null;
    let track = null;
    let slides = [];
    let index = 0;
    let startX = null;
    let moved = false;
    let lastFocus = null;

    function setTrack(i, animate) {
      track.style.transition = animate === false ? 'none' : '';
      track.style.transform = `translate3d(${-i * 100}%, 0, 0)`;
    }

    function update() {
      $('.lb-caption', root).innerHTML = `<span class="accent">${index + 1} / ${slides.length}</span> · ${esc(slides[index].cap)}`;
      $$('.lb-dot', root).forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
      // соседние кадры грузим заранее, остальные — по мере листания
      $$('.lb-img', root).forEach((img, i) => { if (Math.abs(i - index) <= 1) img.loading = 'eager'; });
    }

    function go(i) {
      const n = slides.length;
      index = ((i % n) + n) % n;
      setTrack(index);
      update();
    }

    function open(list, start, label) {
      if (root) close();
      slides = list;
      index = start || 0;
      lastFocus = document.activeElement;
      root = document.createElement('div');
      root.className = 'lb';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', label || 'Скриншоты приложения');
      root.tabIndex = -1;
      root.innerHTML = `
        <div class="lb-bg" aria-hidden="true"></div>
        <div class="lb-viewport">
          <div class="lb-track">
            ${slides.map((s, i) => `<div class="lb-slide"><img class="lb-img" src="${esc(s.src)}" alt="${esc(s.alt)}" decoding="async" draggable="false" loading="${Math.abs(i - index) <= 1 ? 'eager' : 'lazy'}"></div>`).join('')}
          </div>
        </div>
        <div class="lb-top">
          <span class="lb-caption mono"></span>
          <button class="round-btn lb-close" data-lb="close" aria-label="Закрыть просмотр">${ICONS.close(20)}</button>
        </div>
        <button class="lb-nav lb-prev" data-lb="prev" aria-label="Предыдущий скриншот">${ICONS.chevronLeft}</button>
        <button class="lb-nav lb-next" data-lb="next" aria-label="Следующий скриншот">${ICONS.chevronRight}</button>
        <div class="lb-dots">
          ${slides.map((s, i) => `<button class="lb-dot" data-lb-dot="${i}" aria-label="Скриншот ${i + 1}: ${esc(s.cap)}"><span></span></button>`).join('')}
        </div>`;
      page.insertBefore(root, document.getElementById('cursor'));
      track = $('.lb-track', root);
      setTrack(index, false);
      update();

      const viewport = $('.lb-viewport', root);
      viewport.addEventListener('pointerdown', onDown);
      viewport.addEventListener('pointermove', onMove);
      viewport.addEventListener('pointerup', onUp);
      viewport.addEventListener('pointercancel', onUp);
      root.addEventListener('keydown', onKey);
      root.addEventListener('click', onClick);

      document.documentElement.style.overflow = 'hidden';
      root.focus();
    }

    function close() {
      if (!root) return;
      startX = null;
      root.remove();
      root = null;
      document.documentElement.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    function onClick(e) {
      const btn = e.target.closest('[data-lb], [data-lb-dot]');
      if (!btn) return;
      if (btn.dataset.lb === 'close') close();
      else if (btn.dataset.lb === 'prev') go(index - 1);
      else if (btn.dataset.lb === 'next') go(index + 1);
      else go(Number(btn.dataset.lbDot));
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    }

    function onDown(e) { startX = e.clientX; moved = false; }

    function onMove(e) {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) moved = true;
      if (!moved) return;
      track.style.transition = 'none';
      track.style.transform = `translate3d(calc(${-index * 100}% + ${dx}px), 0, 0)`;
    }

    function onUp(e) {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (!moved) {
        // простой клик мимо картинки закрывает просмотр
        if (!e.target.closest('.lb-img')) close();
        return;
      }
      let i = index;
      if (dx < -60) i = Math.min(slides.length - 1, i + 1);
      else if (dx > 60) i = Math.max(0, i - 1);
      index = i;
      setTrack(index);
      update();
    }

    return { open, close };
  })();

  /* =======================================================================
     КУРСОР-КОМЕТА
     Голова следует за мышью, 14 точек хвоста догоняют друг друга.
     Оптимизации:
       - pointermove только запоминает координаты, вся работа — раз в кадр;
       - сглаживание зависит от времени кадра: если браузер пропустил кадр,
         хвост догоняет ровно настолько, насколько успел бы, — без рывков;
       - позиции пишутся только тем точкам, которые реально сдвинулись;
       - когда всё остановилось, цикл засыпает и не тратит ни такта.
     ======================================================================= */
  function initCursor() {
    const layer = document.getElementById('cursor');
    if (!layer) return;

    const TAIL = 14;
    const FOLLOW = 0.45;      // доля пути, которую точка хвоста проходит за «обычный» кадр
    const RING_FOLLOW = 0.22;
    const RING_GROW = 0.18;

    // хвост, кольцо, голова и три набора частиц для «взрыва» по клику
    let html = '';
    for (let i = 0; i < TAIL; i++) {
      const s = 9 - i * 0.5;
      html += `<span class="cur-tail" style="width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;margin:${(-s / 2).toFixed(2)}px 0 0 ${(-s / 2).toFixed(2)}px;opacity:${(0.55 * (1 - i / TAIL)).toFixed(2)}"></span>`;
    }
    html += '<span class="cur-ring"></span><span class="cur-head"></span>';
    for (let b = 0; b < 3; b++) {
      html += '<span class="burst"><span class="burst-ring"></span>';
      for (let k = 0; k < 9; k++) {
        html += `<span class="bp" style="--a:${k * 40 + b * 13}deg;--dist:${30 + ((k * 7 + b * 3) % 5) * 6}px;--sz:${3 + (k % 3) * 1.5}px"></span>`;
      }
      html += '</span>';
    }
    layer.innerHTML = html;

    const tailEls = $$('.cur-tail', layer);
    const headEl = $('.cur-head', layer);
    const ringEl = $('.cur-ring', layer);
    const burstEls = $$('.burst', layer);

    const pts = tailEls.map(() => ({ x: -100, y: -100 }));
    const ring = { x: -100, y: -100, s: 0.5 };
    let mx = -100, my = -100;
    let active = false, hot = false, cursorOn = false;
    let lastTarget = null;
    let raf = 0, lastTime = 0, frameMs = 16.7;
    let headX = null, headY = null, headHot = null, ringHot = null;
    let burstIndex = 0;

    // голова кометы ставится сразу в обработчике движения мыши, не дожидаясь
    // следующего кадра: так она отстаёт от настоящего указателя на кадр меньше
    function placeHead() {
      if (headX === mx && headY === my && headHot === hot) return;
      headEl.style.transform = `translate3d(${mx}px,${my}px,0) scale(${hot ? 0.6 : 1})`;
      headX = mx; headY = my; headHot = hot;
    }

    // коэффициент сглаживания для текущего кадра: на обычном кадре равен base,
    // на «длинном» (браузер был занят) — больше, чтобы хвост не отставал рывком
    const ease = (base, steps) => 1 - Math.pow(1 - base, steps);

    function frame(now) {
      raf = 0;
      if (!active) return;
      const dt = lastTime ? now - lastTime : frameMs;
      lastTime = now;
      // запоминаем типичную длительность кадра экрана (60/120/144 Гц)
      if (dt > 4 && dt < frameMs * 1.5) frameMs += (dt - frameMs) * 0.1;
      const steps = Math.min(Math.max(dt / frameMs, 0.5), 4);
      const k = ease(FOLLOW, steps);

      let moving = false;
      placeHead();

      let px = mx, py = my;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const dx = px - p.x;
        const dy = py - p.y;
        if (dx > 0.3 || dx < -0.3 || dy > 0.3 || dy < -0.3) {
          p.x += dx * k;
          p.y += dy * k;
          moving = true;
          tailEls[i].style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)`;
        }
        px = p.x; py = p.y;
      }

      const target = hot ? 1.2 : 0.5;
      const rdx = mx - ring.x, rdy = my - ring.y, rds = target - ring.s;
      if (rdx > 0.3 || rdx < -0.3 || rdy > 0.3 || rdy < -0.3 || rds > 0.005 || rds < -0.005) {
        const kr = ease(RING_FOLLOW, steps);
        ring.x += rdx * kr;
        ring.y += rdy * kr;
        ring.s += rds * ease(RING_GROW, steps);
        moving = true;
        ringEl.style.transform = `translate3d(${ring.x.toFixed(1)}px,${ring.y.toFixed(1)}px,0) scale(${ring.s.toFixed(3)})`;
      }
      if (ringHot !== hot) {
        ringEl.style.opacity = hot ? '1' : '0';
        ringHot = hot;
      }

      if (moving) raf = requestAnimationFrame(frame);
      else lastTime = 0;
    }

    page.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      if (!active) {
        active = true;
        pts.forEach((p) => { p.x = mx; p.y = my; });
        ring.x = mx; ring.y = my;
        layer.style.opacity = '1';
        if (!cursorOn) { cursorOn = true; page.classList.add('cur-on'); }
      }
      const t = e.target;
      if (t !== lastTarget) {
        lastTarget = t;
        hot = !!(t && t.closest && t.closest('a, button'));
      }
      placeHead();
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });

    page.addEventListener('pointerleave', () => {
      active = false;
      lastTarget = null;
      lastTime = 0;
      layer.style.opacity = '0';
    });

    page.addEventListener('pointerdown', (e) => {
      if (!cursorOn) return;
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const b = burstEls[burstIndex % burstEls.length];
      burstIndex++;
      b.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
      // переключение между двумя одинаковыми анимациями перезапускает «взрыв»
      const next = b.classList.contains('go-a') ? 'go-b' : 'go-a';
      b.classList.remove('go-a', 'go-b');
      b.classList.add(next);
    }, { passive: true });
  }

  /* =======================================================================
     ПАУЗА ВНЕ ЭКРАНА: бесконечные анимации hero и бегущей строки
     не тратят ресурсы, пока их не видно (вид при этом не меняется)
     ======================================================================= */
  function initOffscreenPause() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('is-offscreen', !en.isIntersecting));
    }, { rootMargin: '100px 0px' });
    $$('[data-pause-offscreen]').forEach((el) => io.observe(el));
  }

  /* ---------- старт ---------- */
  initLiteMode();
  initSpace();
  initMarquee();
  initTypewriter();
  initSections();
  initJourneyPath();
  initProjects();
  initDocs();
  initCursor();
  initOffscreenPause();
  initFrameGuard();
})();
