/* ==========================================================================
   BLACK HAT SEO TERMINAL :: shell runtime (no dependencies)
   - boot screen, CRT/theme prefs, clock, drawer nav
   - collapsibles, TOC scroll-spy, copy buttons, checklist persistence
   - full-text search overlay (/ or Ctrl+K), command line (:), shortcuts
   - tools filter, status meter, easter eggs
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const html = document.documentElement;
  html.classList.add('fx');               // enables scroll-in animations; absent = full static fallback
  const BHT = window.BHT || {};           // injected by build: {base, page, pages:[...], version}
  const base = BHT.base ?? './';
  const pageHref = file => BHT.inline ? ((BHT.pages || []).find(p => p.originalFile === file)?.file || '#p-00_start-here') : base + file;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bht.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bht.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const oracleEntry = BHT.page === 'oracle.html' || (BHT.inline && location.hash.startsWith('#p-00b_black-hat-oracle'));

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg, ms) {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms || 2600);
  }

  /* ---------- prefs ---------- */
  function applyPrefs() {
    html.classList.toggle('crt-off', store.get('crt', 'on') === 'off');
    const th = store.get('theme', 'amber'); if (th === 'green') html.setAttribute('data-theme', 'green'); else html.removeAttribute('data-theme');
  }
  applyPrefs();

  /* ---------- easter egg registry ---------- */
  const EGGS = ['fallen-hacker', 'binary-prophecy', 'missing-egg', 'philosopher', 'konami', 'title-glitch', 'sudo', 'xyzzy', 'neofetch', 'exit'];
  function foundEgg(id, label) {
    const f = store.get('eggs', []);
    if (!f.includes(id)) { f.push(id); store.set('eggs', f); toast('🥚 Easter egg found: ' + (label || id) + ' (' + f.length + '/' + EGGS.length + ')', 3200); }
  }

  /* ---------- boot ---------- */
  function boot() {
    const el = $('.boot'); if (!el) return;
    const off = store.get('boot', 'on') === 'off';
    let shown = false; try { shown = sessionStorage.getItem('bht.booted') === '1'; } catch (e) {}
    if (off || shown || reduced || oracleEntry) { el.remove(); return; }
    try { sessionStorage.setItem('bht.booted', '1'); } catch (e) {}
    const lines = [
      '<span class="hd">BLACKHAT-BIOS ' + BHT.version + '</span>  (c) Optimization Theory :: educational build',
      'POST ............................................ <span class="ok">OK</span>',
      'cpu: spam-analysis-engine x8    mem: 640K evidence blocks',
      '',
      'mount /archive (ro) ............................. <span class="ok">OK</span>',
      'mount /tools (' + (BHT.toolCount || 0) + ' records) ................... <span class="ok">OK</span>',
      'load  search.index ............................. <span class="ok">OK</span>',
      'start crt.service .............................. <span class="ok">OK</span>',
      'start scanline.daemon .......................... <span class="ok">OK</span>',
      'verify legal.disclaimer ........................ <span class="warn">PRESENT</span>',
      'check  user.privileges ......................... uid=1000 (not root)',
      '',
      'decrypting archive [░░░░░░░░░░░░░░░░░░░░]   0%'
    ];
    // frames after the decrypt line animate a progress bar, then grant access
    const barFrames = [];
    for (let p = 5; p <= 100; p += 5) barFrames.push('decrypting archive [' + '█'.repeat(p / 5) + '░'.repeat(20 - p / 5) + '] ' + String(p).padStart(3) + '%');
    const tail = [
      '',
      '<span class="grant">ACCESS GRANTED.</span> Welcome, visitor.',
      'type  <span class="ok">:help</span>  for commands  ·  press  <span class="ok">/</span>  to search',
      ''
    ];
    el.classList.add('on'); el.innerHTML = '<div class="out"></div><span class="cursor"></span><div class="skip">press any key to skip</div>';
    const out = $('.out', el); let i = 0, done = false, bf = 0, phase = 0;
    const finish = () => { if (done) return; done = true; el.classList.remove('on'); setTimeout(() => el.remove(), 60); };
    const tick = () => {
      if (done) return;
      if (phase === 0) { // type header lines
        out.innerHTML += lines[i++] + '\n'; out.scrollTop = out.scrollHeight;
        if (i >= lines.length) { phase = 1; }
        return void setTimeout(tick, 46 + Math.random() * 55);
      }
      if (phase === 1) { // rewrite the last line as the bar fills
        const parts = out.innerHTML.split('\n'); parts[parts.length - 2] = barFrames[bf++];
        out.innerHTML = parts.join('\n'); out.scrollTop = out.scrollHeight;
        if (bf >= barFrames.length) { phase = 2; i = 0; }
        return void setTimeout(tick, 34);
      }
      if (i < tail.length) { out.innerHTML += tail[i++] + '\n'; out.scrollTop = out.scrollHeight; return void setTimeout(tick, 60 + Math.random() * 70); }
      setTimeout(finish, 620);
    };
    tick();
    el.addEventListener('click', finish); document.addEventListener('keydown', finish, { once: true });
  }

  /* ---------- clock ---------- */
  function clock() {
    const c = $('.topbar .clock'); if (!c) return;
    const f = () => { const d = new Date(); c.textContent = d.toTimeString().slice(0, 8); }; f(); setInterval(f, 1000);
  }

  /* ---------- drawer ---------- */
  function drawer() {
    const b = $('.menu-btn'); if (!b) return;
    const setOpen = open => { html.classList.toggle('nav-open', open); b.setAttribute('aria-expanded', String(open)); b.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); };
    const close = () => setOpen(false);
    b.addEventListener('click', () => setOpen(!html.classList.contains('nav-open')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && html.classList.contains('nav-open')) { close(); b.focus(); } });
    $('.scrim') && $('.scrim').addEventListener('click', close);
    $$('.sidebar a').forEach(a => a.addEventListener('click', close));
  }

  /* ---------- collapsibles ---------- */
  function collapsibles() {
    $$('.collapsible').forEach(c => {
      const content = c.nextElementSibling;
      if (!content || !content.classList.contains('collapsible-content')) return;
      // keep the two in sync (some archive markup had mismatched initial states)
      const open = c.classList.contains('active') || content.classList.contains('active');
      c.classList.toggle('active', open); content.classList.toggle('active', open);
      if (!content.id) content.id = c.id + '-panel';
      c.setAttribute('aria-controls', content.id);
      c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-expanded', open ? 'true' : 'false');
      const tog = (force) => { const o = typeof force === 'boolean' ? force : !c.classList.contains('active'); c.classList.toggle('active', o); content.classList.toggle('active', o); c.setAttribute('aria-expanded', o ? 'true' : 'false'); };
      c.addEventListener('click', () => tog());
      c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
      c._toggle = tog;
    });
    // expand / collapse all buttons
    $$('[data-expand-all]').forEach(b => b.addEventListener('click', () => $$('.collapsible').forEach(c => c._toggle && c._toggle(true))));
    $$('[data-collapse-all]').forEach(b => b.addEventListener('click', () => $$('.collapsible').forEach(c => c._toggle && c._toggle(false))));
  }
  function revealHash() {
    if (!location.hash) return;
    let el; try { el = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) {}
    if (!el) return;
    // open every collapsed ancestor
    let p = el; while (p && p !== document.body) { if (p.classList && p.classList.contains('collapsible-content') && !p.classList.contains('active')) { const c = p.previousElementSibling; c && c._toggle && c._toggle(true); } p = p.parentElement; }
    if (el.classList.contains('collapsible') && el._toggle) el._toggle(true);
    setTimeout(() => { el.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }); el.classList.add('hl-target'); setTimeout(() => el.classList.remove('hl-target'), 2300); }, 30);
  }

  /* ---------- TOC scroll spy ---------- */
  function tocSpy() {
    const links = $$('.toc a[href^="#"], .tree .sub a[href*="#"]'); if (!links.length) return;
    const map = new Map();
    links.forEach(a => { const id = a.getAttribute('href').split('#')[1]; const el = id && document.getElementById(id); if (el) { if (!map.has(el)) map.set(el, []); map.get(el).push(a); } });
    const targets = Array.from(map.keys()); if (!targets.length) return;
    let current = null;
    const setCur = el => { if (el === current) return; current = el; links.forEach(a => a.parentElement.classList.remove('current')); (map.get(el) || []).forEach(a => a.parentElement.classList.add('current')); };
    const onScroll = () => { const y = window.scrollY + 90; let best = targets[0]; for (const t of targets) { if (t.getBoundingClientRect().top + window.scrollY <= y) best = t; else break; } setCur(best); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- copy buttons ---------- */
  function copyButtons() {
    $$('.code-block, .content pre').forEach(p => {
      if (p.closest('.ascii-art') || p.closest('.banner') || p.closest('.oracle')) return;
      const b = document.createElement('button'); b.className = 'copy-btn'; b.type = 'button'; b.textContent = 'copy';
      b.addEventListener('click', () => {
        const content = p.cloneNode(true);
        content.querySelectorAll('.copy-btn').forEach(button => button.remove());
        if (!navigator.clipboard) { toast('Clipboard unavailable; select and copy the text.'); return; }
        navigator.clipboard.writeText(content.textContent).then(() => { b.textContent = 'copied'; setTimeout(() => b.textContent = 'copy', 1200); }).catch(() => toast('Clipboard unavailable; select and copy the text.'));
      });
      p.appendChild(b);
    });
  }

  /* ---------- checklists persist ---------- */
  function checklists() {
    const boxes = $$('.content input[type="checkbox"]'); if (!boxes.length) return;
    const key = 'checks.' + (BHT.page || location.pathname);
    const saved = store.get(key, {});
    boxes.forEach((b, i) => { const id = b.id || ('cb' + i); if (saved[id]) b.checked = true; b.addEventListener('change', () => { saved[id] = b.checked; store.set(key, saved); }); });
  }

  /* ---------- search ---------- */
  let INDEX = null, loading = null;
  function loadIndex() {
    if (INDEX) return Promise.resolve(INDEX);
    // prefer the inlined index (search-index.js sets this) so search works from file:// too
    if (window.BHT_INDEX) { INDEX = window.BHT_INDEX; return Promise.resolve(INDEX); }
    if (loading) return loading;
    loading = fetch(base + 'search-index.json').then(r => r.json()).then(j => { INDEX = j; return j; }).catch(() => { INDEX = []; return INDEX; });
    return loading;
  }
  function tokenize(q) { return q.toLowerCase().split(/[^a-z0-9$%.+#-]+/).filter(t => t.length > 1); }
  function doSearch(q, limit) {
    const terms = tokenize(q); if (!terms.length) return [];
    const res = [];
    for (const e of INDEX) {
      const t = e.t.toLowerCase(), x = e.x.toLowerCase(), p = e.p.toLowerCase(); let score = 0, pos = -1;
      for (const term of terms) {
        const inT = t.indexOf(term) >= 0, inP = p.indexOf(term) >= 0;
        let c = 0, i = x.indexOf(term); if (i >= 0 && pos < 0) pos = i; while (i >= 0 && c < 8) { c++; i = x.indexOf(term, i + term.length); }
        if (!inT && !inP && !c) { score = 0; break; }
        score += (inT ? 12 : 0) + (inP ? 3 : 0) + c;
      }
      if (score > 0) res.push({ e, score, pos });
    }
    res.sort((a, b) => b.score - a.score);
    return res.slice(0, limit || 40);
  }
  function snippet(x, pos, terms) {
    if (pos < 0) pos = 0; const s = Math.max(0, pos - 70), t = x.slice(s, s + 190);
    let out = (s > 0 ? '…' : '') + esc(t) + (s + 190 < x.length ? '…' : '');
    terms.forEach(term => { out = out.replace(new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
    return out;
  }
  function esc(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  // Both overlays share one lifecycle: accessible modal state, background
  // isolation, keyboard containment, and restoration to the original trigger.
  let activeModal = null;
  function modalController(dialog, input, onClose) {
    let previous = null;
    const close = () => {
      if (!dialog.classList.contains('open')) return;
      dialog.classList.remove('open');
      $('.term').inert = false;
      activeModal = null;
      if (onClose) onClose();
      if (previous?.isConnected) previous.focus();
    };
    const open = () => {
      if (activeModal && activeModal.close !== close) activeModal.close();
      if (!dialog.classList.contains('open')) previous = document.activeElement;
      dialog.classList.add('open');
      $('.term').inert = true;
      activeModal = { close };
      input.focus();
    };
    dialog.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      const elements = $$('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]', dialog).filter(el => !el.closest('[hidden]'));
      const first = elements[0], last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    $('[data-close-dialog]', dialog)?.addEventListener('click', close);
    return { open, close };
  }
  function searchUI() {
    const ov = $('.search'); if (!ov) return;
    const inp = $('input', ov), res = $('.results', ov), meta = $('.meta .n', ov); let sel = 0, cur = [];
    const modal = modalController(ov, inp);
    const open = (q) => { inp.value = q || ''; modal.open(); loadIndex().then(() => { meta && (meta.textContent = INDEX.length + ' blocks indexed'); render(); }); };
    const close = modal.close;
    const render = () => {
      const q = inp.value.trim(); if (!INDEX) return;
      if (!q) { res.innerHTML = '<div class="empty">Type to search every section, tool, table and case study.</div>'; cur = []; if (meta) meta.textContent = INDEX.length + ' blocks indexed'; return; }
      cur = doSearch(q); sel = 0; const terms = tokenize(q);
      if (meta) meta.textContent = cur.length + ' results shown';
      if (!cur.length) { res.innerHTML = '<div class="empty">grep: no matches for "' + esc(q) + '"</div>'; return; }
      res.innerHTML = cur.map((r, i) => '<a class="r' + (i === 0 ? ' sel' : '') + '" href="' + base + r.e.u + (r.e.a ? '#' + r.e.a : '') + '"><div class="p">' + esc(r.e.p) + '</div><div class="t">' + esc(r.e.t) + '</div><div class="s">' + snippet(r.e.x, r.pos, terms) + '</div></a>').join('');
    };
    inp.addEventListener('input', render);
    inp.addEventListener('keydown', e => {
      const items = $$('.r', res);
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); if (items[sel]) { const href = items[sel].getAttribute('href'); close(); if (href.startsWith('#') || href.split('#')[0] === location.pathname.split('/').pop() || href.startsWith(base + (BHT.page || '___'))) { location.hash = href.split('#')[1] || ''; revealHash(); } else location.href = href; } return; }
      else if (e.key === 'Escape') { close(); return; }
      else return;
      items.forEach((it, i) => it.classList.toggle('sel', i === sel)); items[sel] && items[sel].scrollIntoView({ block: 'nearest' });
    });
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    res.addEventListener('click', e => { if (e.target.closest('a[href]')) close(); });
    $$('[data-open-search]').forEach(b => b.addEventListener('click', () => open()));
    window.BHT_openSearch = open; window.BHT_closeSearch = close;
  }

  /* ---------- command line ---------- */
  const HISTORY = [];
  const FORTUNES = [
    'A build timestamp cannot verify a source.',
    'A hypothesis is not an observed result.',
    'Correlation brought a friend: confounding.',
    'Fortune cookie: your next core update will be... unhelpful.',
    'The strongest claim is the one you can trace.'
  ];
  function cow(text) {
    const t = (text || 'moo').slice(0, 60), l = t.length; const b = '-'.repeat(l + 2);
    return ' ' + b + '\n< ' + t + ' >\n ' + b + '\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||';
  }
  function neofetch() {
    const th = html.getAttribute('data-theme') || 'amber';
    const eggs = store.get('eggs', []).length;
    const art = ['     ▄▄▄▄▄▄▄▄▄     ', '   ▄█▀       ▀█▄   ', '  ██  ▄▀▀▀▀▀▄  ██  ', '  ██  █ ▄ ▄ █  ██  ', '  ██   ▀▀▀▀▀   ██  ', '   ▀█▄  ▀▀▀  ▄█▀   ', '     ▀▀▀▀▀▀▀▀▀     ', '   BLACK HAT SEO   ', '     TERMINAL      '];
    const info = ['visitor@blackhat-terminal', '-------------------------', 'OS: BHT ' + (BHT.version || 'unknown') + ' (' + th + '-crt)', 'Interface: local educational shell', 'Shell: ' + BHT.version, 'Sections: ' + ((BHT.pages || []).length || '?'), 'Tool records: ' + (BHT.toolCount || '?'), 'Evidence limits: see methodology', 'Eggs found: ' + eggs + '/' + EGGS.length];
    return art.map((a, i) => '<span class="a">' + a + '</span>   ' + (info[i] || '')).join('\n');
  }
  const COMMANDS = {
    help() { return [
      '<span class="a">BHT shell — commands</span>',
      '  <span class="k">help</span>, <span class="k">man</span>            this list',
      '  <span class="k">ls</span>                   list archive sections',
      '  <span class="k">cd</span> &lt;n|name&gt;          open a section (e.g. cd 5, cd tools)',
      '  <span class="k">grep</span> &lt;term&gt;          full-text search (also: / key)',
      '  <span class="k">expand</span> / <span class="k">collapse</span>    open or close every panel on this page',
      '  <span class="k">theme</span> amber|green    switch phosphor',
      '  <span class="k">crt</span> on|off           scanlines & vignette',
      '  <span class="k">boot</span> on|off          boot screen on first visit',
      '  <span class="k">neofetch</span>, <span class="k">uptime</span>, <span class="k">fortune</span>, <span class="k">cowsay</span>, <span class="k">history</span>, <span class="k">clear</span>',
      '  <span class="k">eggs</span>                 easter egg progress',
      '  keys: <span class="k">/</span> search  <span class="k">:</span> command  <span class="k">?</span> help  <span class="k">[</span> <span class="k">]</span> prev/next  <span class="k">Esc</span> close'
    ].join('\n'); },
    man() { return COMMANDS.help(); },
    '?'() { return COMMANDS.help(); },
    ls(args) {
      const pages = BHT.pages || []; if (!pages.length) return 'ls: /archive is empty';
      return 'total ' + pages.length + '\n' + pages.map((p, i) => '<span class="a">-r--r--r--</span>  visitor  research  ' + String(p.size || 0).padStart(7) + '  ' + String(i).padStart(2, '0') + '  <span class="k">' + p.file + '</span>  ' + (p.title || '')).join('\n');
    },
    cd(args) {
      const pages = BHT.pages || []; let q = (args[0] || '').toLowerCase().replace(/\/$/, '');
      q = ({ labs: 'lab-library', cases: 'case-database', defense: 'detection-defense' })[q] || q;
      if (!q || q === '~' || q === 'home' || q === '..') { window.BHT_closeCmd?.(); location.href = pageHref('index.html'); return 'cd ~'; }
      const hit = pages.find((p, i) => String(i) === q || String(i).padStart(2, '0') === q || p.file === q || p.originalFile === q || p.originalFile === q + '.html' || p.originalFile?.startsWith(q) || p.file === q + '.html' || p.file.startsWith(q) || (p.title || '').toLowerCase().includes(q));
      if (!hit) return '<span class="err">cd: no such section: ' + esc(q) + '</span>  (try: ls)';
      window.BHT_closeCmd?.(); location.href = BHT.inline ? hit.file : base + hit.file; return 'cd ' + hit.file;
    },
    open(a) { return COMMANDS.cd(a); }, goto(a) { return COMMANDS.cd(a); },
    cat(a) { return a[0] ? COMMANDS.cd(a) : 'cat: missing operand (try: cat tools)'; },
    pwd() { return '/archive/' + (BHT.page || 'index.html'); },
    grep(a) { const q = a.join(' '); if (!q) return 'usage: grep <term>'; setTimeout(() => window.BHT_openSearch && window.BHT_openSearch(q), 10); return 'grep -rin "' + esc(q) + '" /archive …'; },
    find(a) { return COMMANDS.grep(a); }, search(a) { return COMMANDS.grep(a); },
    expand() { $$('.collapsible').forEach(c => c._toggle && c._toggle(true)); return '<span class="ok">expanded every panel</span>'; },
    collapse() { $$('.collapsible').forEach(c => c._toggle && c._toggle(false)); return '<span class="ok">collapsed every panel</span>'; },
    theme(a) { const t = (a[0] || '').toLowerCase(); if (t !== 'amber' && t !== 'green') return 'usage: theme amber|green  (current: ' + (html.getAttribute('data-theme') || 'amber') + ')'; store.set('theme', t); applyPrefs(); return '<span class="ok">theme → ' + t + ' phosphor</span>'; },
    crt(a) { const v = (a[0] || '').toLowerCase(); if (v !== 'on' && v !== 'off') return 'usage: crt on|off'; store.set('crt', v); applyPrefs(); return '<span class="ok">crt effects ' + v + '</span>'; },
    boot(a) { const v = (a[0] || '').toLowerCase(); if (v !== 'on' && v !== 'off') return 'usage: boot on|off'; store.set('boot', v); return '<span class="ok">boot screen ' + v + '</span>'; },
    clear() { return '\0clear'; },
    history() { return HISTORY.map((h, i) => String(i + 1).padStart(4) + '  ' + esc(h)).join('\n') || '(empty)'; },
    whoami() { return 'visitor  uid=1000(visitor) gid=1000(researchers) groups=defensive,educational\nNot root. Never root.'; },
    id() { return COMMANDS.whoami(); },
    sudo(a) { foundEgg('sudo', 'sudo'); const s = a.join(' ').toLowerCase(); if (s.includes('sandwich')) return 'Okay.'; if (s.includes('rm')) return '<span class="err">rm: cannot remove \'/\': Permission denied.</span>\nNice try. Google already tried.'; return '<span class="err">visitor is not in the sudoers file. This incident will be reported to SpamBrain.</span>'; },
    rm(a) { if (a.join(' ').includes('/')) return '<span class="err">rm: cannot remove \'/\': Read-only file system.</span>\n(This playful terminal does not modify website files.)'; return 'rm: missing operand'; },
    uptime() { const s = Math.round(performance.now() / 1000); return 'PLAYFUL SHELL STATUS — ' + new Date().toTimeString().slice(0, 8) + ' up ' + Math.floor(s / 60) + ' min, 1 user, load average: 0.63 (SpamBrain), 0.37 (evasion), 0.00 (sleep)'; },
    top() { return 'FICTIONAL PROCESS DISPLAY — no real system metrics\nPID  USER      %CPU  COMMAND\n  1  google    97.3  spambrain --mode=neural\n  2  visitor    2.1  read --defensive\n  3  operator   0.6  cloak --serverless (zombie)'; },
    ping(a) { return 'FICTIONAL PING — no network request sent\nPING ' + esc(a[0] || 'google.com') + ' (SpamBrain): 56 data bytes\nRequest timeout for icmp_seq 0\nRequest timeout for icmp_seq 1\n--- they see you. 100% packet loss ---'; },
    nmap() { return '<span class="err">nmap: blocked by legal department.</span> See 18 U.S.C. § 1030 (CFAA).'; },
    fortune() { return FORTUNES[Math.floor(Math.random() * FORTUNES.length)]; },
    cowsay(a) { return '<pre>' + esc(cow(a.join(' '))) + '</pre>'; },
    neofetch() { foundEgg('neofetch', 'neofetch'); return '<pre>' + neofetch() + '</pre>'; },
    date() { return new Date().toString(); },
    matrix() { matrixRain(); return '<span class="ok">wake up, neo…</span>'; },
    hack() { html.classList.add('glitch'); setTimeout(() => html.classList.remove('glitch'), 2200); return '<span class="a">HACK THE PLANET</span>'; },
    exit() { foundEgg('exit', 'exit'); return 'There is no exit. Only deindexing.'; },
    quit() { return COMMANDS.exit(); }, logout() { return COMMANDS.exit(); },
    vim() { return 'E37: No write since last change (add ! to override). Also this is a website.'; },
    emacs() { return 'emacs: not enough RAM in the observable universe.'; },
    nano() { return 'nano is fine. We don\'t judge.'; },
    xyzzy() { foundEgg('xyzzy', 'xyzzy'); return 'Nothing happens.'; },
    eggs() { const f = store.get('eggs', []); return 'Easter eggs found: ' + f.length + '/' + EGGS.length + (f.length ? '\n  ' + f.join(', ') : '') + '\nHints: hover the ASCII eggs, click the title 7 times, try old cheat codes, misbehave in the shell.'; },
    konami() { godMode(); return 'cheat accepted'; },
    version() { return 'BHT ' + (BHT.version || 'unknown') + ' — built ' + (BHT.built || '?'); }
  };
  function cmdUI() {
    const c = $('.cmd'); if (!c) return;
    const inp = $('input', c), out = $('.cmd-out', c); let hi = -1;
    const modal = modalController(c, inp, () => out.classList.remove('open'));
    const open = (pre) => { inp.value = pre || ''; modal.open(); };
    const close = modal.close;
    const print = (s) => { if (s === '\0clear') { out.innerHTML = ''; out.classList.remove('open'); return; } out.innerHTML += s + '\n'; out.classList.add('open'); out.scrollTop = out.scrollHeight; };
    const run = (line) => {
      line = line.trim(); if (!line) return; HISTORY.push(line); hi = HISTORY.length;
      print('<span class="a">visitor@bht:~$</span> ' + esc(line));
      const parts = line.replace(/^:/, '').split(/\s+/); const name = parts[0].toLowerCase(); const args = parts.slice(1);
      if (name === 'hack' && args.join(' ').toLowerCase().includes('planet')) return print(COMMANDS.hack());
      if (/^\d+$/.test(name)) return print(COMMANDS.cd([name]));
      const fn = COMMANDS[name];
      if (fn) { try { print(fn(args)); } catch (e) { print('<span class="err">' + esc(String(e)) + '</span>'); } }
      else print('<span class="err">bht: command not found: ' + esc(name) + '</span>  (try: help)');
    };
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { run(inp.value); inp.value = ''; }
      else if (e.key === 'Escape') close();
      else if (e.key === 'ArrowUp') { if (hi > 0) { hi--; inp.value = HISTORY[hi] || ''; } e.preventDefault(); }
      else if (e.key === 'ArrowDown') { if (hi < HISTORY.length) { hi++; inp.value = HISTORY[hi] || ''; } e.preventDefault(); }
      else if (e.key === 'ArrowRight' && inp.selectionStart === inp.value.length && inp.selectionEnd === inp.value.length) { const v = inp.value.toLowerCase(); const m = Object.keys(COMMANDS).filter(k => k.startsWith(v)); if (v && m.length === 1) { e.preventDefault(); inp.value = m[0] + ' '; } }
    });
    $$('[data-open-cmd]').forEach(b => b.addEventListener('click', () => open()));
    window.BHT_openCmd = open; window.BHT_closeCmd = close; window.BHT_run = run;
  }

  /* ---------- keyboard ---------- */
  function keys() {
    let buf = '';
    const KONAMI = 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba'; let kb = '';
    document.addEventListener('keydown', e => {
      const tag = (e.target.tagName || '').toLowerCase(); const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      // konami
      kb += e.key; if (kb.length > KONAMI.length) kb = kb.slice(-KONAMI.length); if (kb.toLowerCase() === KONAMI.toLowerCase()) { kb = ''; godMode(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); window.BHT_openSearch && window.BHT_openSearch(); return; }
      if (activeModal) return;
      if (typing) return;
      // xyzzy typed anywhere
      buf = (buf + e.key).slice(-5); if (buf.toLowerCase() === 'xyzzy') { foundEgg('xyzzy', 'xyzzy'); toast('Nothing happens.'); buf = ''; }
      if (e.key === '/') { e.preventDefault(); window.BHT_openSearch && window.BHT_openSearch(); }
      else if (e.key === ':') { e.preventDefault(); window.BHT_openCmd && window.BHT_openCmd(); }
      else if (e.key === '?') { e.preventDefault(); window.BHT_openCmd && window.BHT_openCmd(); window.BHT_run && window.BHT_run('help'); }
      else if (e.key === 'Escape') { window.BHT_closeCmd && window.BHT_closeCmd(); window.BHT_closeSearch && window.BHT_closeSearch(); }
      else if (e.key === '[' || e.key === ']') {
        if (BHT.inline) {
          const sections = $$('.bundle-section'); let current = 0;
          sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= 100) current = i; });
          const next = sections[current + (e.key === '[' ? -1 : 1)]; if (next) location.hash = next.id;
        } else { const a = $(e.key === '[' ? '.pager a.prev' : '.pager a.next'); if (a) location.href = a.href; }
      }
      else if (e.key.toLowerCase() === 'e' && e.shiftKey) { COMMANDS.expand(); toast('expanded all'); }
      else if (e.key.toLowerCase() === 'c' && e.shiftKey) { COMMANDS.collapse(); toast('collapsed all'); }
    });
  }

  /* ---------- easter eggs ---------- */
  function godMode() {
    foundEgg('konami', 'Konami code');
    const on = html.getAttribute('data-theme') === 'green';
    store.set('theme', on ? 'amber' : 'green'); applyPrefs();
    html.classList.add('glitch'); setTimeout(() => html.classList.remove('glitch'), 2200);
    toast(on ? 'GOD MODE OFF — back to amber.' : 'GOD MODE: root@blackhat-terminal … just kidding. Still uid=1000. Enjoy the green phosphor.', 4200);
    $$('.egg-hidden').forEach(el => el.classList.remove('egg-hidden'));
  }
  function matrixRain() {
    if (reduced) { toast('matrix: reduced motion is on, so: 01010111 01000101 00100000 01010011 01000101 01000101 00100000 01011001 01001111 01010101'); return; }
    let cv = $('#matrix'); if (!cv) { cv = document.createElement('canvas'); cv.id = 'matrix'; document.body.appendChild(cv); }
    cv.classList.add('on'); cv.width = innerWidth; cv.height = innerHeight; const ctx = cv.getContext('2d');
    const cols = Math.floor(cv.width / 14), drops = Array(cols).fill(1); const chars = 'アイウエオカキクケコ01$#%&BHTSEO';
    const col = getComputedStyle(html).getPropertyValue('--amber').trim() || '#ffb000';
    let n = 0; const iv = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.fillStyle = col; ctx.font = '14px monospace';
      drops.forEach((y, i) => { ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14); if (y * 14 > cv.height && Math.random() > 0.975) drops[i] = 0; drops[i]++; });
      if (++n > 170) { clearInterval(iv); cv.classList.remove('on'); ctx.clearRect(0, 0, cv.width, cv.height); }
    }, 35);
  }
  function eggs() {
    $$('[data-egg]').forEach(el => { const id = el.getAttribute('data-egg'); const f = () => foundEgg(id, el.getAttribute('data-egg-label') || id); el.addEventListener('mouseenter', f); el.addEventListener('click', f); });
    const title = $('.topbar .title'); let clicks = 0, t;
    title && title.addEventListener('click', () => { clicks++; clearTimeout(t); t = setTimeout(() => clicks = 0, 1500); if (clicks === 7) { clicks = 0; foundEgg('title-glitch', 'title glitch'); title.classList.add('glitch'); setTimeout(() => title.classList.remove('glitch'), 2200); toast('SEGFAULT (core dumped). Just kidding. 7 clicks — you found it.'); } });
  }

  /* ---------- tools filter + grid/table toggle + sort ---------- */
  function toolsFilter() {
    const bar = $('.tools-toolbar'); if (!bar) return;
    const cards = $$('.tool-card'); const count = $('.count', bar); const q = $('input', bar);
    const rows = $$('.tools-table tbody tr');
    const state = { cat: null, risk: null, q: '' };
    const match = (el) => (!state.cat || el.getAttribute('data-cat') === state.cat)
      && (!state.risk || el.getAttribute('data-risk') === state.risk)
      && (!state.q || el.textContent.toLowerCase().includes(state.q));
    const apply = () => {
      let n = 0; cards.forEach(c => { const ok = match(c); c.classList.toggle('hidden', !ok); if (ok) n++; });
      // hide empty groups (grid view: content panel + its collapsible header)
      $$('.tool-group').forEach(g => { const empty = !$$('.tool-card:not(.hidden)', g).length; g.classList.toggle('hidden', empty); const hdr = g.previousElementSibling; if (hdr && hdr.classList.contains('collapsible')) hdr.classList.toggle('hidden', empty); });
      // table rows
      let rn = 0; rows.forEach(r => { const ok = match(r); r.classList.toggle('hidden', !ok); if (ok) rn++; });
      const shown = document.body.classList.contains('tools-as-table') ? rn : n;
      count && (count.textContent = shown + ' / ' + cards.length + ' tool records');
    };
    $$('.chip[data-cat]', bar).forEach(ch => ch.addEventListener('click', () => { state.cat = state.cat === ch.getAttribute('data-cat') ? null : ch.getAttribute('data-cat'); $$('.chip[data-cat]', bar).forEach(x => x.classList.toggle('on', x.getAttribute('data-cat') === state.cat)); apply(); }));
    $$('.chip[data-risk]', bar).forEach(ch => ch.addEventListener('click', () => { state.risk = state.risk === ch.getAttribute('data-risk') ? null : ch.getAttribute('data-risk'); $$('.chip[data-risk]', bar).forEach(x => x.classList.toggle('on', x.getAttribute('data-risk') === state.risk)); apply(); }));
    q && q.addEventListener('input', () => { state.q = q.value.trim().toLowerCase(); apply(); });
    const legacy = $('#toolSearch'); legacy && legacy.addEventListener('input', () => { state.q = legacy.value.trim().toLowerCase(); q && (q.value = legacy.value); apply(); });

    // grid ⇄ table toggle
    const setView = (v) => {
      document.body.classList.toggle('tools-as-table', v === 'table');
      $$('.tools-view button', bar).forEach(b => { const on = b.getAttribute('data-view') === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      store.set('toolsView', v); apply();
    };
    $$('.tools-view button', bar).forEach(b => b.addEventListener('click', () => setView(b.getAttribute('data-view'))));

    // sortable table columns
    const table = $('.tools-table');
    if (table) {
      const tbody = $('tbody', table); const heads = $$('thead th[data-sort]', table); let sortKey = null, sortDir = 1;
      const val = (tr, key) => key === 'risk' ? +tr.getAttribute('data-riskrank') : key === 'price' ? +tr.getAttribute('data-price') : key === 'name' ? tr.getAttribute('data-name') : (tr.getAttribute('data-cat') || '').toLowerCase();
      heads.forEach(th => th.addEventListener('click', () => {
        const key = th.getAttribute('data-sort');
        if (sortKey === key) sortDir = -sortDir; else { sortKey = key; sortDir = 1; }
        heads.forEach(h => { h.classList.remove('sort-asc', 'sort-desc'); h.setAttribute('aria-sort', 'none'); });
        th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
        th.setAttribute('aria-sort', sortDir === 1 ? 'ascending' : 'descending');
        $$('tr', tbody).sort((a, b) => { const x = val(a, key), y = val(b, key); return (x < y ? -1 : x > y ? 1 : 0) * sortDir; }).forEach(tr => tbody.appendChild(tr));
      }));
    }

    setView(store.get('toolsView', 'grid'));
  }

  /* ---------- find page: live filter of the master index ---------- */
  function findFilter() {
    const input = $('.find-input'); if (!input) return;
    const items = $$('.find-item'); const groups = $$('.find-group'); const blocks = $$('.find-block');
    const count = $('.find-count'); const empty = $('.find-empty');
    const tech = count ? +count.getAttribute('data-tech') || 0 : 0, tools = count ? +count.getAttribute('data-tools') || 0 : 0;
    const base = tech + ' topics · ' + tools + ' tool records';
    const setCount = (n) => { if (count) count.textContent = n === null ? base : (n + ' match' + (n === 1 ? '' : 'es')); };
    setCount(null);
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { items.forEach(i => i.classList.remove('hidden')); groups.forEach(g => g.classList.remove('hidden')); blocks.forEach(b => b.classList.remove('hidden')); empty && (empty.hidden = true); setCount(null); return; }
      let n = 0; items.forEach(i => { const ok = i.getAttribute('data-f').indexOf(q) >= 0; i.classList.toggle('hidden', !ok); if (ok) n++; });
      groups.forEach(g => g.classList.toggle('hidden', !$$('.find-item:not(.hidden)', g).length));
      blocks.forEach(b => b.classList.toggle('hidden', !$$('.find-item:not(.hidden)', b).length));
      empty && (empty.hidden = n > 0);
      setCount(n);
    };
    input.addEventListener('input', apply);
    // allow deep-linking a filter: find.html?q=cloaking
    try { const q = new URLSearchParams(location.search).get('q'); if (q) { input.value = q; apply(); } } catch (e) {}
  }

  /* ---------- status meter ---------- */
  function meter() {
    const bar = $('.statusbar .meter .bar i'), pct = $('.statusbar .meter .pct'); if (!bar) return;
    const f = () => { const h = document.documentElement; const p = h.scrollHeight - innerHeight <= 0 ? 0 : Math.min(100, Math.round(window.scrollY / (h.scrollHeight - innerHeight) * 100)); bar.style.width = p + '%'; pct && (pct.textContent = p + '%'); };
    f(); window.addEventListener('scroll', f, { passive: true }); window.addEventListener('resize', f);
  }

  /* ---------- table wrap (horizontal scroll on small screens) ---------- */
  function tables() { $$('.content table.data-table').forEach(t => { if (t.parentElement.classList.contains('table-wrap')) return; const w = document.createElement('div'); w.className = 'table-wrap'; t.parentNode.insertBefore(w, t); w.appendChild(t); }); }

  /* ---------- reveal-on-scroll (banners, diagrams, cards) ---------- */
  function reveals() {
    const els = $$('.reveal'); if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- typewriter on the document title ($ cat …) ---------- */
  function typeTitle() {
    if (reduced || oracleEntry) return;
    const h = $('.doc-head h1'); if (!h) return;
    let txtNode = null; h.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) txtNode = n; });
    if (!txtNode) return;
    const full = txtNode.textContent; if (full.length > 60) return; txtNode.textContent = '';
    const caret = document.createElement('span'); caret.textContent = '▋';
    caret.style.color = 'var(--accent)'; caret.style.animation = 'blink 1s steps(1) infinite';
    h.appendChild(caret);
    let i = 0;
    const step = () => { if (i <= full.length) { txtNode.textContent = full.slice(0, i++); setTimeout(step, 28); } else setTimeout(() => caret.remove(), 900); };
    setTimeout(step, 240);
  }

  /* ---------- animated data-stream dividers before section headers ---------- */
  function dividers() {
    if (reduced) return;
    const heads = $$('.content .section-header'); if (!heads.length) return;
    const seg = '01001000 01000001 01000011 01001011  ▚▚▚  0xDEADBEEF  ::  SIGNAL ACQUIRED  ::  ';
    const stream = seg.repeat(4);
    heads.forEach(h => {
      const prev = h.previousElementSibling;
      if (prev && prev.classList.contains('datastream')) return;
      const d = document.createElement('div'); d.className = 'datastream'; d.setAttribute('aria-hidden', 'true');
      const span = document.createElement('i'); span.textContent = stream + stream; d.appendChild(span);
      h.parentNode.insertBefore(d, h);
    });
  }

  /* ---------- live topbar / statusbar readouts ---------- */
  function liveReadouts() {
    const ping = $('.topbar .leds .ping b');
    if (ping) { const upd = () => { ping.textContent = (17 + Math.floor(Math.random() * 46)) + 'ms'; }; upd(); setInterval(upd, 2600 + Math.random() * 1600); }
    const sig = $$('.topbar .leds .sig i');
    if (sig.length) { const upd = () => { const n = 2 + Math.floor(Math.random() * 3); sig.forEach((b, idx) => b.classList.toggle('on', idx < n)); }; upd(); setInterval(upd, 3300); }
    const scan = $('.statusbar .scantxt');
    if (scan && !reduced) { const st = ['SCANNING', 'INDEXING', 'MONITOR', 'ANALYZING', 'TRACING']; let k = 0; setInterval(() => { k = (k + 1) % st.length; scan.textContent = st[k]; }, 3600); }
  }

  /* ---------- section titles: fade + underline draw on scroll ---------- */
  function sectionTitles() {
    const els = $$('.content h2, .content .section-header, .section-header');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    boot(); clock(); drawer(); collapsibles(); tables(); copyButtons(); checklists(); tocSpy(); searchUI(); cmdUI(); keys(); eggs(); toolsFilter(); findFilter(); meter(); revealHash();
    reveals(); typeTitle(); dividers(); liveReadouts(); sectionTitles();
    window.addEventListener('hashchange', revealHash);
  });
})();
