(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Seeded random numbers, so the drawings look the same on every visit. */
  function rng(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Email link, assembled here so the address is not sitting in the HTML. */
  const user = 'wenjia586';
  const host = 'gmail.com';
  document.querySelectorAll('[data-email]').forEach((a) => {
    a.href = 'mailto:' + user + '@' + host;
    if (a.dataset.email === 'show') a.textContent = user + '@' + host;
  });

  /* Optional file buttons appear once their PDF exists in the repository. */
  document.querySelectorAll('[data-file]').forEach((a) => {
    fetch(a.getAttribute('href'), { method: 'HEAD' })
      .then((res) => { if (res.ok) a.hidden = false; })
      .catch(() => {});
  });

  /* Experience filter */
  const buttons = Array.from(document.querySelectorAll('[data-filter]'));
  const jobs = Array.from(document.querySelectorAll('#experience .job'));
  const status = document.getElementById('filter-status');

  function setFilter(kind) {
    let shown = 0;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === kind)));
    jobs.forEach((j) => {
      const match = kind === 'all' || j.dataset.kind.split(' ').indexOf(kind) !== -1;
      j.hidden = !match;
      if (match) shown += 1;
    });
    if (status) status.textContent = 'Showing ' + shown + ' of ' + jobs.length + ' roles.';
  }

  buttons.forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.filter)));
  document.querySelectorAll('[data-lens]').forEach((a) => {
    a.addEventListener('click', () => setFilter(a.dataset.lens));
  });

  /* Current section in the navigation */
  const links = Array.from(document.querySelectorAll('.nav ul a'));
  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => {
          l.setAttribute('aria-current', String(l.getAttribute('href') === '#' + entry.target.id));
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((l) => {
      const target = document.querySelector(l.getAttribute('href'));
      if (target) seen.observe(target);
    });
  }

  /* Small drawings beside each research entry */
  const NS = 'http://www.w3.org/2000/svg';
  function node(name, attrs, style) {
    const n = document.createElementNS(NS, name);
    Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    if (style) Object.assign(n.style, style);
    return n;
  }

  const motifs = {
    cloud(svg) {
      const r = rng(11);
      for (let i = 0; i < 120; i += 1) {
        const floor = i < 75;
        const x = floor ? 6 + r() * 124 : 6 + r() * 54;
        const y = floor ? 66 + Math.pow(r(), 0.8) * 40 : 12 + r() * 52;
        svg.append(node('circle',
          { cx: x.toFixed(1), cy: y.toFixed(1), r: (0.8 + r() * 1.3).toFixed(1) },
          { fill: r() < 0.15 ? 'var(--rose-ink)' : 'var(--rose)', opacity: (0.35 + r() * 0.6).toFixed(2) }));
      }
    },
    tube(svg) {
      const d = 'M8 98 C 30 24, 58 112, 90 50 S 118 20, 128 10';
      svg.append(node('path', { d, fill: 'none', 'stroke-width': 14, 'stroke-linecap': 'round' },
        { stroke: 'var(--rose)', opacity: 0.38 }));
      svg.append(node('path', { d, fill: 'none', 'stroke-width': 1.5, 'stroke-dasharray': '3 4' },
        { stroke: 'var(--rose-ink)' }));
      svg.append(node('circle', { cx: 90, cy: 50, r: 4 }, { fill: 'var(--rose-ink)' }));
    },
    rays(svg) {
      for (let i = 0; i <= 6; i += 1) {
        svg.append(node('line', { x1: 6 + i * 20.7, y1: 6, x2: 6 + i * 20.7, y2: 106 }, { stroke: 'var(--plum)', opacity: 0.14 }));
        svg.append(node('line', { x1: 6, y1: 6 + i * 16.7, x2: 130, y2: 6 + i * 16.7 }, { stroke: 'var(--plum)', opacity: 0.14 }));
      }
      for (let k = 0; k < 5; k += 1) {
        svg.append(node('line',
          { x1: 6, y1: 14 + k * 20, x2: 130, y2: 98 - k * 20, 'stroke-width': 1.3 },
          { stroke: 'var(--rose-ink)', opacity: 0.75 }));
      }
    },
    imu(svg) {
      const r = rng(5);
      [['var(--rose)', 26, 0.9, 0], ['var(--rose-ink)', 56, 0.9, 1], ['var(--plum)', 86, 0.35, 2]].forEach((c) => {
        let d = '';
        for (let x = 6; x <= 130; x += 4) {
          const burst = x > 50 && x < 96 ? 1.8 : 0.5;
          const y = c[1] + Math.sin(x * 0.18 + c[3] * 1.7) * 9 * burst + (r() - 0.5) * 3;
          d += (x === 6 ? 'M' : 'L') + x + ' ' + y.toFixed(1) + ' ';
        }
        svg.append(node('path', { d, fill: 'none', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, { stroke: c[0], opacity: c[2] }));
      });
      svg.append(node('rect', { x: 50, y: 6, width: 46, height: 100, rx: 4, fill: 'none', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, { stroke: 'var(--rose-ink)' }));
    },
    film(svg) {
      svg.append(node('rect', { x: 14, y: 70, width: 108, height: 26 }, { fill: 'var(--plum)', opacity: 0.12 }));
      svg.append(node('rect', { x: 14, y: 54, width: 108, height: 16 }, { fill: 'var(--rose)', opacity: 0.65 }));
      svg.append(node('rect', { x: 14, y: 38, width: 108, height: 16 }, { fill: 'var(--rose-ink)', opacity: 0.85 }));
      [36, 68, 100].forEach((x) => {
        svg.append(node('line', { x1: x, y1: 8, x2: x, y2: 32, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, { stroke: 'var(--rose-ink)' }));
        svg.append(node('circle', { cx: x, cy: 34, r: 2.5 }, { fill: 'var(--rose-ink)' }));
      });
    },
    dialogue(svg) {
      svg.append(node('rect', { x: 8, y: 14, width: 76, height: 32, rx: 14 }, { fill: 'var(--rose)', opacity: 0.55 }));
      svg.append(node('rect', { x: 52, y: 62, width: 76, height: 32, rx: 14 }, { fill: 'var(--rose-ink)', opacity: 0.8 }));
      [[22, 26, 44], [22, 34, 30]].forEach((l) => {
        svg.append(node('line', { x1: l[0], y1: l[1], x2: l[0] + l[2], y2: l[1], 'stroke-width': 2, 'stroke-linecap': 'round' }, { stroke: 'var(--cream)' }));
      });
      [[66, 74, 46], [66, 82, 32]].forEach((l) => {
        svg.append(node('line', { x1: l[0], y1: l[1], x2: l[0] + l[2], y2: l[1], 'stroke-width': 2, 'stroke-linecap': 'round' }, { stroke: 'var(--cream)' }));
      });
    }
  };

  document.querySelectorAll('[data-motif]').forEach((svg) => {
    const draw = motifs[svg.dataset.motif];
    if (draw) draw(svg);
  });

  /* Hero: a vessel point cloud that is scanned in once, then turns slowly. */
  function initCloud() {
    const canvas = document.getElementById('cloud');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rand = rng(2026);
    const pts = [];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = (v) => {
      const l = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / l, v[1] / l, v[2] / l];
    };

    function tube(curve, count, r0, r1) {
      for (let i = 0; i < count; i += 1) {
        const t = rand();
        const p = curve(t);
        const T = norm(sub(curve(Math.min(1, t + 0.01)), curve(Math.max(0, t - 0.01))));
        let N = cross(T, [0, 0, 1]);
        if (Math.hypot(N[0], N[1], N[2]) < 1e-3) N = cross(T, [1, 0, 0]);
        N = norm(N);
        const B = cross(T, N);
        const th = rand() * Math.PI * 2;
        const rad = (r0 + (r1 - r0) * t) * (0.92 + rand() * 0.16);
        const c = Math.cos(th) * rad;
        const s = Math.sin(th) * rad;
        pts.push({
          x: p[0] + N[0] * c + B[0] * s,
          y: p[1] + N[1] * c + B[1] * s,
          z: p[2] + N[2] * c + B[2] * s,
          ink: rand() < 0.14,
          size: 0.8 + rand() * 1.2,
          noise: false
        });
      }
    }

    const trunk = (t) => [Math.sin(t * 3.1) * 0.42, -1.05 + t * 2.1, Math.cos(t * 2.4) * 0.32];
    const P = trunk(0.55);
    const branchA = (s) => [P[0] + s * 0.85 + Math.sin(s * 3) * 0.08, P[1] + s * 0.78, P[2] - s * 0.4];
    const branchB = (s) => [P[0] - s * 0.75, P[1] + s * 0.85, P[2] + s * 0.55];
    const A1 = branchA(0.55);
    const branchC = (s) => [A1[0] + s * 0.5, A1[1] + s * 0.55, A1[2] + s * 0.35 + Math.sin(s * 4) * 0.05];

    tube(trunk, 1500, 0.17, 0.12);
    tube(branchA, 800, 0.11, 0.065);
    tube(branchB, 700, 0.10, 0.06);
    tube(branchC, 300, 0.065, 0.04);
    for (let i = 0; i < 260; i += 1) {
      pts.push({
        x: (rand() - 0.5) * 2.4,
        y: (rand() - 0.5) * 2.6,
        z: (rand() - 0.5) * 1.6,
        ink: false,
        size: 0.6 + rand() * 0.8,
        noise: true
      });
    }

    const ROSE = '#D98BA0';
    const INK = '#9C3A5E';
    const PLUM = '#3A2630';
    let W = 0;
    let H = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(ay, ax, reveal) {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      const cyr = Math.cos(ay);
      const syr = Math.sin(ay);
      const cxr = Math.cos(ax);
      const sxr = Math.sin(ax);
      const scale = Math.min(H * 0.36, W * 0.38);
      const dist = 3.4;

      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        const yn = (p.y + 1.1) / 2.3;
        if (yn > reveal) continue;
        const edge = reveal - yn < 0.05 && reveal < 1.05;

        const x1 = p.x * cyr + p.z * syr;
        const z1 = -p.x * syr + p.z * cyr;
        const y2 = p.y * cxr - z1 * sxr;
        const z2 = p.y * sxr + z1 * cxr;
        const f = dist / (dist - z2);
        const sx = W / 2 + x1 * scale * f;
        const sy = H / 2 - y2 * scale * f;

        let a = 0.22 + 0.55 * ((z2 + 1.2) / 2.4);
        a = Math.max(0.12, Math.min(0.85, a));
        if (p.noise) a *= 0.5;

        ctx.globalAlpha = edge ? 0.95 : a;
        ctx.fillStyle = edge ? PLUM : (p.ink ? INK : ROSE);
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * f * (edge ? 1.3 : 0.9), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    resize();

    if (reduceMotion) {
      draw(0.7, -0.12, 1.2);
      window.addEventListener('resize', () => { resize(); draw(0.7, -0.12, 1.2); });
      return;
    }

    let mx = 0.5;
    let my = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let start = performance.now();
    let raf = 0;
    let visible = true;

    window.addEventListener('pointermove', (e) => {
      mx = Math.min(1, Math.max(0, e.clientX / window.innerWidth));
      my = Math.min(1, Math.max(0, e.clientY / window.innerHeight));
    }, { passive: true });

    function loop(now) {
      const t = now - start;
      const p = Math.min(1, t / 2600);
      const reveal = (1 - Math.pow(1 - p, 3)) * 1.08;
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;
      draw(0.5 + t * 0.00014 + (tx - 0.5) * 0.7, -0.12 + (ty - 0.5) * 0.35, reveal);
      raf = window.requestAnimationFrame(loop);
    }

    function play() {
      if (!raf && visible && !document.hidden) raf = window.requestAnimationFrame(loop);
    }
    function pause() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) play(); else pause();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause(); else play();
    });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);

    start = performance.now();
    play();
  }

  initCloud();
})();
