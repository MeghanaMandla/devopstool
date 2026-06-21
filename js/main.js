// ===== SCROLL PROGRESS =====
(function(){
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.body.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  });
})();

// ===== BACK TO TOP =====
(function(){
  const btn = document.getElementById('back-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 500));
  btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
})();

// ===== MOBILE NAV =====
(function(){
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
})();

// ===== ACTIVE NAV LINK =====
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });
})();

// ===== SCROLL REVEAL =====
(function(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e,i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 50);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

// ===== GSAP HERO TIMELINE (if present) =====
if (typeof gsap !== 'undefined') {
  const heroEls = ['.hero-badge', '.hero-title', '.hero-sub', '.hero-actions', '.terminal', '.stat-strip'];
  const tl = gsap.timeline({ delay: .25 });
  heroEls.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (el) tl.to(el, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, i === 0 ? 0 : '-=.4');
  });
}

// ===== TERMINAL TYPER (hero signature element) =====
(function(){
  const body = document.getElementById('terminal-body');
  if (!body) return;
  const sequence = [
    { type: 'cmd', text: 'docker build -t myapp:latest .' },
    { type: 'out', text: '✓ Successfully built and tagged myapp:latest' },
    { type: 'cmd', text: 'kubectl apply -f deployment.yaml' },
    { type: 'out', text: 'deployment.apps/myapp created · service/myapp-svc created' },
    { type: 'cmd', text: 'terraform apply -auto-approve' },
    { type: 'out', text: '✓ Apply complete! 12 resources added, 0 changed, 0 destroyed.' },
  ];
  let lineIdx = 0;

  function typeLine() {
    if (lineIdx >= sequence.length) {
      setTimeout(() => { body.innerHTML = ''; lineIdx = 0; typeLine(); }, 2500);
      return;
    }
    const item = sequence[lineIdx];
    const row = document.createElement('div');
    row.className = 'term-line';
    if (item.type === 'cmd') {
      row.innerHTML = `<span class="term-prompt">$</span><span class="term-cmd" id="typing-target"></span>`;
      body.appendChild(row);
      const target = row.querySelector('#typing-target');
      let ci = 0;
      const typeChar = () => {
        if (ci <= item.text.length) {
          target.textContent = item.text.slice(0, ci);
          if (ci < item.text.length) target.innerHTML += '<span class="term-cursor"></span>';
          ci++;
          setTimeout(typeChar, 28 + Math.random()*30);
        } else {
          lineIdx++;
          setTimeout(typeLine, 350);
        }
      };
      typeChar();
    } else {
      row.innerHTML = `<span class="term-out">${item.text}</span>`;
      row.style.opacity = '0';
      body.appendChild(row);
      requestAnimationFrame(() => { row.style.transition = 'opacity .3s'; row.style.opacity = '1'; });
      lineIdx++;
      setTimeout(typeLine, 500);
    }
    body.scrollTop = body.scrollHeight;
  }
  setTimeout(typeLine, 1400);
})();

// ===== COUNTER ANIMATION =====
(function(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-num[data-target]').forEach(el => {
          const target = +el.dataset.target;
          let cur = 0, step = target / 50;
          const t = setInterval(() => {
            cur = Math.min(cur + step, target);
            el.textContent = Math.floor(cur).toLocaleString();
            if (cur >= target) clearInterval(t);
          }, 24);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .4 });
  document.querySelectorAll('.stat-strip').forEach(el => obs.observe(el));
})();

// ===== 3D TILT ON CARDS =====
(function(){
  document.querySelectorAll('.feature-card, .tool-card, .glass.tiltable').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * 8;
      const y = ((e.clientY - r.top) / r.height - .5) * -8;
      card.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
})();

// ===== COPY TO CLIPBOARD (generators) =====
function copyToClipboard(elId, btnEl) {
  const el = document.getElementById(elId);
  if (!el) return;
  const text = el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const original = btnEl.textContent;
    btnEl.textContent = '✓ Copied';
    btnEl.classList.add('copied');
    setTimeout(() => { btnEl.textContent = original; btnEl.classList.remove('copied'); }, 1800);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    btnEl.textContent = '✓ Copied';
    setTimeout(() => btnEl.textContent = 'Copy', 1800);
  });
}

// ===== DOWNLOAD AS FILE =====
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
