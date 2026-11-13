// ============================================================
// Ice Room Walkthrough — interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollProgress();
  initBackToTop();
  initPhaseToggles();
  initCopyButtons();
  initHeroTyping();
  initSpoiler();
  initCertifications();
  initFAQ();
});

/* ---------- Mobile nav ---------- */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = max > 0 ? `${(scrolled / max) * 100}%` : '0%';
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  document.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Expandable walkthrough phases ---------- */
function initPhaseToggles() {
  document.querySelectorAll('.phase-toggle').forEach(btn => {
    const body = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (body) body.hidden = expanded;
    });
  });
}

/* ---------- Copy-to-clipboard on commands ---------- */
function initCopyButtons() {
  document.querySelectorAll('.copy-cmd').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.title = 'Click to copy';
    const copy = () => {
      const text = el.textContent.trim();
      navigator.clipboard?.writeText(text).then(() => {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1200);
      }).catch(() => {});
    };
    el.addEventListener('click', copy);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); } });
  });
}

/* ---------- Hero terminal typing animation ---------- */
function initHeroTyping() {
  const target = document.querySelector('.cmd-type');
  if (!target) return;
  const text = target.getAttribute('data-text') || '';
  let i = 0;
  target.textContent = '';
  const tick = () => {
    if (i <= text.length) {
      target.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, 28);
    }
  };
  tick();
}

/* ============================================================
   Credential spoiler
   The lab credential + hashes are stored base64-encoded below
   rather than as plain searchable text, and only decoded into
   the page after the user explicitly clicks "reveal".
   Editable: update ENCODED_CREDS if the lab values change.
   ============================================================ */
const ENCODED_CREDS = {
  'Username':  'RGFyaw==',                                           // Dark
  'Domain':    'RGFyay1QQw==',                                       // Dark-PC
  'Password':  'UGFzc3dvcmQwMSE=',                                   // Password01!
  'LM hash':   'ZTUyY2FjNjc0MTlhOWEyMmVjYjA4MzY5MDk5ZWQzMDI=',        // e52cac67419a9a22ecb08369099ed302
  'NTLM hash': 'N2M0ZmU1ZWFkYTY4MjcxNGEwMzZlMzkzNzgzNjJiYWI=',        // 7c4fe5eada682714a036e39378362bab
  'SHA1 hash': 'MGQwODJjNGI0ZjJhZWFmYjY3ZmQwZWE1NjhhOTk3ZTlkM2ViYzBlYg==' // 0d082c4b4f2aeafb67fd0ea568a997e9d3ebc0eb
};

function initSpoiler() {
  const btn = document.getElementById('spoilerBtn');
  const content = document.getElementById('spoilerContent');
  const list = document.getElementById('credList');
  if (!btn || !content || !list) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    content.hidden = isOpen;
    btn.textContent = isOpen ? 'Reveal the lab credential — spoiler' : 'Hide the lab credential';

    if (!isOpen && !list.dataset.populated) {
      Object.entries(ENCODED_CREDS).forEach(([label, encoded]) => {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        try { dd.textContent = atob(encoded); } catch (e) { dd.textContent = '(decode failed)'; }
        list.appendChild(dt);
        list.appendChild(dd);
      });
      list.dataset.populated = 'true';
    }
  });
}

/* ---------- Certifications (only shown if provided) ---------- */
// Add entries here exactly as: { name: "Certification Name" }
// Leave the array empty to show nothing — do not invent entries.
const CERTIFICATIONS = [
  // { name: "HCIA-Datacom"| "CCNA-1" | "NSE-1~ Fortinet" |"HCIA-Security"| "HCIP-Datacom(Ongoing)" | "CCNA-2(Ongoing)"| "CC ~ ISC2"},

];

function initCertifications() {
  const el = document.getElementById('certPreview');
  if (!el || CERTIFICATIONS.length === 0) return;
  CERTIFICATIONS.forEach(cert => {
    const span = document.createElement('span');
    span.className = 'cert-badge';
    span.textContent = cert.name;
    el.appendChild(span);
  });
}

/* ---------- Knowledge check / FAQ ---------- */
const FAQ_ITEMS = [
  { q: 'Which port was Icecast running on?', a: '8000 (TCP)' },
  { q: 'Which port was Microsoft Remote Desktop running on?', a: '3389 (TCP)' },
  { q: 'What was the target hostname?', a: 'DARK-PC' },
  { q: 'What Windows build was identified?', a: '7601 (Windows 7 Service Pack 1)' },
  { q: 'What was the initial Meterpreter architecture, and did it match the OS?', a: 'x86 — it did NOT match the x64 operating system, which is what caused the bypassuac_comhijack failures.' },
  { q: 'Which process was used for migration to reach SYSTEM?', a: 'spoolsv.exe (the Print Spooler service)' },
  { q: 'Which Windows account/privilege was obtained after migration?', a: 'NT AUTHORITY\\SYSTEM' },
  { q: 'Which Kiwi command retrieves all parsed credentials at once?', a: 'creds_all' },
];

function initFAQ() {
  const container = document.getElementById('faqList');
  if (!container) return;
  FAQ_ITEMS.forEach((item, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'faq-item';

    const q = document.createElement('button');
    q.className = 'faq-q';
    q.setAttribute('aria-expanded', 'false');
    q.innerHTML = `<span>${item.q}</span><span aria-hidden="true">+</span>`;

    const a = document.createElement('div');
    a.className = 'faq-a';
    a.textContent = item.a;

    q.addEventListener('click', () => {
      const open = a.classList.toggle('open');
      q.setAttribute('aria-expanded', String(open));
    });

    wrap.appendChild(q);
    wrap.appendChild(a);
    container.appendChild(wrap);
  });
}
