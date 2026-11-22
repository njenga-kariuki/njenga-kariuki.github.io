/* Flagship Essay Shell (v3.5):
   - Reading progress line (#prog), scroll-revealed header title (--rh) + Living TOC scroll-spy
   - One-shot editorial figure scroll choreography ([data-reveal]) using njenga.ai's easing curve
   - Inline click-to-peek citation drawers ([data-cite])
   - Section permalink copy + contract clause / email copy utilities
   - Optional voice audio edition player (essay-audio.js) */
import { initEssayAudio } from './essay-audio.js?v=3.4';

const D = document;
const $ = (s, r = D) => r.querySelector(s);
const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

const live = (msg) => {
  const l = $('#live');
  if (!l) return;
  l.textContent = '';
  setTimeout(() => { l.textContent = msg; }, 50);
};

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = D.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    D.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = D.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/* 1. Reading progress bar (#prog), header title reveal (--rh) + Living TOC scroll-spy */
function initReadingProgressAndTOC() {
  const hd = $('#hd');
  const h1 = $('#es-h1');
  const prog = $('#prog');
  const article = $('article.es-article');
  const tocLinks = $$('.es-toc-list a[href^="#"]');
  const sections = tocLinks
    .map((a) => D.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  let raf = 0;
  const tick = () => {
    raf = 0;
    if (hd && h1) {
      const headH = parseFloat(getComputedStyle(D.documentElement).getPropertyValue('--head')) || 56;
      const p = Math.min(1, Math.max(0, (headH + 20 - h1.getBoundingClientRect().bottom) / 28));
      hd.style.setProperty('--rh', p.toFixed(3));
      hd.classList.toggle('rh', p >= 1);
    }
    if (prog && article) {
      const end = Math.max(1, article.offsetTop + article.offsetHeight - innerHeight);
      const ratio = Math.max(0, Math.min(1, scrollY / end));
      prog.style.transform = `scaleX(${ratio.toFixed(4)})`;
    }
    if (sections.length) {
      const cut = innerHeight * 0.34;
      let cur = 0;
      sections.forEach((sec, i) => {
        if (sec.getBoundingClientRect().top <= cut) cur = i;
      });
      tocLinks.forEach((a, i) => {
        a.classList.toggle('on', i === cur);
        a.classList.toggle('done', i < cur);
        if (i === cur) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  tick();

  const mobToc = $('.es-toc-mob');
  if (mobToc) {
    $$('a[href^="#"]', mobToc).forEach((a) => {
      a.addEventListener('click', () => { mobToc.open = false; });
    });
  }
}

/* 2. One-shot Swiss editorial figure reveal choreography (geometric marks only; never hides text) */
function initEditorialReveals() {
  const figs = $$('[data-reveal]');
  const drawers = $$('.ed-drawer');

  addEventListener('beforeprint', () => {
    figs.forEach((el) => { el.classList.add('in'); el.classList.remove('armed'); });
    drawers.forEach((d) => { d.open = true; });
  });

  if (!figs.length) return;

  if (RM || !('IntersectionObserver' in window)) {
    figs.forEach((el) => el.classList.add('in'));
    return;
  }

  const reveal = (el) => {
    el.classList.add('in');
    el.classList.remove('armed');
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -20px 0px' });

  figs.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top <= innerHeight * 0.96) {
      el.classList.add('in');
    } else {
      el.classList.add('armed');
      io.observe(el);
    }
  });
}

/* 3. Inline Click-to-Peek Citations */
function initCitations() {
  const dataEl = $('#essay-citations');
  if (!dataEl) return;
  let cites = {};
  try { cites = JSON.parse(dataEl.textContent); } catch { return; }

  let openBtn = null;
  let openDrawer = null;

  const closeDrawer = (restoreFocus = false) => {
    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'false');
      if (restoreFocus) openBtn.focus();
    }
    if (openDrawer) openDrawer.remove();
    openBtn = null;
    openDrawer = null;
  };

  $$('button.cite[data-cite]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.cite;
      const item = cites[id];
      if (!item) return;

      if (openBtn === btn) {
        closeDrawer(false);
        return;
      }
      closeDrawer(false);

      const host = btn.closest('p, li, blockquote, .es-stat') || btn.parentElement;
      const drawer = D.createElement('aside');
      drawer.className = 'cite-drawer';
      drawer.setAttribute('role', 'note');
      drawer.setAttribute('aria-label', `Source ${id}`);

      const linkHtml = item.url
        ? `<a href="${item.url}" rel="noopener" target="_blank">Primary source</a>`
        : '';

      drawer.innerHTML = `
        <div class="cite-drawer-top">
          <div>
            <p class="cite-drawer-k">Source [${id}] · ${item.pub} · ${item.date}</p>
            <p class="cite-drawer-t">${item.title}</p>
            <p class="cite-drawer-s">${item.scope}</p>
            <p class="cite-drawer-links">
              ${linkHtml}
              <a href="../../credits/#africa-ai-bottleneck">Full bibliography</a>
            </p>
          </div>
          <button type="button" class="cite-close" aria-label="Close source note">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
        </div>`;

      $('.cite-close', drawer).addEventListener('click', () => closeDrawer(true));
      host.insertAdjacentElement('afterend', drawer);
      btn.setAttribute('aria-expanded', 'true');
      openBtn = btn;
      openDrawer = drawer;
      live(`Opened source ${id}: ${item.title}`);
    });
  });

  D.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openDrawer) closeDrawer(true);
  });
}

/* 4. Section Anchor Permalink Copy + Contract Clause & Email Copy */
function initCopyControls() {
  $$('button.sec-link[data-anchor]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = `${location.origin}${location.pathname}#${btn.dataset.anchor}`;
      const ok = await copyText(url);
      if (!ok) return;
      const prev = btn.textContent;
      btn.classList.add('copied');
      btn.textContent = 'Copied link';
      live('Section link copied');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = prev;
      }, 1700);
    });
  });

  $$('button.es-copy-btn[data-copy-text]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copyText);
      if (!ok) return;
      const prev = btn.textContent;
      btn.classList.add('copied');
      btn.textContent = 'Copied';
      live('Text copied to clipboard');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = prev;
      }, 1700);
    });
  });
}

initReadingProgressAndTOC();
initEditorialReveals();
initCitations();
initCopyControls();
initEssayAudio({ live });
