/* Spintax Machine: local thesaurus spinner with four transparent duplicate checks. No network requests. */
(function () {
  'use strict';

  /* Synonym groups. Every member of a group can replace any other member. */
  const GROUPS = [
    'best|top|finest|leading|greatest|ultimate', 'good|great|solid|excellent|fantastic|superb', 'bad|poor|terrible|awful',
    'big|large|huge|massive|major', 'small|little|tiny|compact', 'fast|quick|rapid|speedy|swift',
    'quickly|rapidly|swiftly|speedily|in no time', 'easy|simple|effortless|painless|hassle-free', 'easily|effortlessly|simply|without hassle',
    'cheap|affordable|budget-friendly|low-cost|inexpensive', 'important|essential|crucial|vital|key|critical', 'new|fresh|brand-new|latest',
    'free|no-cost|complimentary|zero-cost', 'amazing|incredible|awesome|remarkable|stunning', 'beautiful|gorgeous|lovely|attractive|elegant',
    'unique|one-of-a-kind|distinctive|original', 'popular|trending|in-demand|well-liked', 'powerful|strong|potent|robust',
    'effective|efficient|productive|successful', 'professional|skilled|qualified|seasoned', 'perfect|ideal|flawless|optimal',
    'complete|full|comprehensive|total|thorough', 'many|numerous|countless|plenty of|lots of', 'more|additional|extra|further',
    'every|each|every single', 'real|genuine|authentic|true', 'local|nearby|neighborhood|hometown', 'online|on the web|on the internet|digital',
    'happy|glad|pleased|delighted', 'better|superior|improved|stronger', 'trusted|reliable|dependable|reputable',
    'way|method|approach|technique|strategy', 'ways|methods|approaches|techniques|strategies', 'tips|tricks|hacks|pointers|secrets',
    'traffic|visitors|site visits|web traffic', 'website|site|web page|online presence|web property', 'websites|sites|web pages|web properties',
    'content|copy|articles|material|posts', 'article|post|blog post|write-up|piece', 'people|users|folks|readers|individuals',
    'customers|clients|buyers|shoppers|consumers', 'business|company|brand|firm|enterprise', 'businesses|companies|brands|firms',
    'results|outcomes|returns|gains', 'money|cash|revenue|income|profit', 'guide|handbook|walkthrough|tutorial|playbook',
    'product|item|offering|solution', 'products|items|offerings|solutions', 'service|package|program', 'services|packages|programs',
    'team|crew|staff|squad', 'expert|specialist|pro|authority', 'experts|specialists|pros|authorities', 'ranking|position|placement|spot',
    'rankings|positions|placements|spots', 'home|house|residence', 'problem|issue|challenge|headache', 'problems|issues|challenges|headaches',
    'idea|concept|notion|thought', 'ideas|concepts|notions|thoughts', 'price|cost|rate|fee', 'prices|costs|rates|fees',
    'deal|bargain|offer|steal', 'deals|bargains|offers|steals', 'quality|caliber|standard|excellence', 'growth|expansion|progress|momentum',
    'success|victory|achievement|win', 'information|info|details|data|insights', 'today|now|right now|these days',
    'also|additionally|furthermore|plus|as well', 'very|really|extremely|incredibly|highly', 'because|since|given that',
    'however|but|yet|still', 'help|assist|support|aid', 'helps|assists|supports|aids', 'helping|assisting|supporting|aiding',
    'make|create|build|produce|craft', 'makes|creates|builds|produces|crafts', 'making|creating|building|producing|crafting',
    'get|obtain|acquire|gain|earn', 'gets|obtains|acquires|earns', 'getting|obtaining|acquiring|earning',
    'use|utilize|employ|leverage|apply', 'using|utilizing|employing|leveraging', 'find|discover|locate|uncover|track down',
    'finding|discovering|locating|uncovering', 'need|require|want|must have', 'needs|requires|wants',
    'improve|enhance|boost|upgrade|optimize', 'improves|enhances|boosts|upgrades', 'increase|grow|raise|expand|multiply',
    'increases|grows|raises|expands', 'buy|purchase|order|pick up|grab', 'start|begin|launch|kick off', 'learn|master|figure out|understand',
    'show|reveal|demonstrate|present', 'shows|reveals|demonstrates|presents', 'give|provide|deliver|supply', 'gives|provides|delivers|supplies',
    'work|function|operate|perform', 'works|functions|operates|performs', 'try|test|attempt|experiment with', 'choose|pick|select|opt for',
    'save|conserve|hold on to', 'love|adore|enjoy|appreciate', 'know|realize|recognize', 'think|believe|feel|reckon',
    'see|view|notice|observe', 'look|appear|seem', 'rank|score|place', 'drive|generate|attract|pull in', 'reach|hit|attain|achieve',
    'sell|market|promote|push', 'run|manage|handle|oversee', 'keep|maintain|retain|hold', 'successful|thriving|profitable|flourishing',
    'sales|revenue streams|conversions|orders', 'simple tips|easy tricks|quick hacks', 'in order to|so as to|to'
  ].map(g => g.split('|'));

  const STOP = new Set('a an the and or but to of in on for with at by from is are was were be been being it its this that these those your you our we they their them what which who how why when where as if so than then can will just not no do does did i my me he she his her has have had into about up out all any some there here would could should may might must'.split(' '));
  const EXAMPLES = [
    'The best way to get more traffic to your website is to create great content that helps people find what they need quickly.',
    'Our professional team provides affordable services that help small businesses grow their online presence fast.',
    'Discover the top tips to improve your rankings and increase sales with simple, effective strategies.',
    'Buy cheap products online today and save money with the latest deals from trusted local experts.',
    'This amazing guide shows you how to start a successful business and make real money from home.',
    'Many customers love our new service because it is easy to use and gives great results every time.'
  ];
  const N_VERSIONS = 50;

  /* Index: lowercase phrase -> group id. Stopword-only members are not indexed for lookup. */
  const INDEX = new Map(); let MAXLEN = 1;
  GROUPS.forEach((g, gi) => g.forEach(m => {
    const words = m.split(' ');
    if (words.length === 1 && STOP.has(m)) return;
    if (!INDEX.has(m)) INDEX.set(m, gi);
    MAXLEN = Math.max(MAXLEN, words.length);
  }));

  function init() {
    const root = document.querySelector('[data-spx]');
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';
    const $ = s => root.querySelector(s);
    const make = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sleep = ms => new Promise(r => setTimeout(r, reduced.matches ? 0 : ms));
    const text = $('[data-spx-text]'), go = $('[data-spx-go]'), err = $('[data-spx-error]'), chars = $('[data-spx-chars]');
    const stage = $('[data-spx-stage]'), explode = $('[data-spx-explode]'), combosEl = $('[data-spx-combos]'), comboNote = $('[data-spx-combo-note]');
    const reelsEl = $('[data-spx-reels]'), lever = $('[data-spx-lever]'), list = $('[data-spx-list]'), outCount = $('[data-spx-outcount]');
    const heat = $('[data-spx-heat]'), hctx = heat.getContext('2d');
    let run = 0, model = null, versions = [], results = null, heatMode = 'shingle', exampleIx = 0;

    const updateChars = () => { chars.textContent = text.value.length + ' / 600'; };
    text.addEventListener('input', () => { updateChars(); err.hidden = true; });
    updateChars();

    /* ---------- parsing ---------- */
    function parse(str) {
      const raw = str.replace(/\s+/g, ' ').trim();
      const toks = raw.match(/[A-Za-z][A-Za-z'-]*|[^A-Za-z]+/g) || [];
      const segs = [];
      for (let i = 0; i < toks.length; i++) {
        const t = toks[i];
        if (!/^[A-Za-z]/.test(t)) { segs.push({ t: 'x', s: t }); continue; }
        let hit = null;
        for (let len = MAXLEN; len >= 1 && !hit; len--) {
          const parts = [t]; let j = i, ok = true;
          while (parts.length < len) {
            if (toks[j + 1] !== ' ' || !toks[j + 2] || !/^[A-Za-z]/.test(toks[j + 2])) { ok = false; break; }
            parts.push(toks[j + 2]); j += 2;
          }
          if (!ok) continue;
          const key = parts.join(' ').toLowerCase();
          if (INDEX.has(key)) hit = { key, end: j, orig: parts.join(' ') };
        }
        if (hit) { segs.push({ t: 'g', g: INDEX.get(hit.key), orig: hit.orig, key: hit.key }); i = hit.end; }
        else segs.push({ t: 'x', s: t });
      }
      return segs;
    }
    function caseLike(orig, word) {
      if (orig.length > 1 && orig === orig.toUpperCase()) return word.toUpperCase();
      if (orig[0] === orig[0].toUpperCase()) return word[0].toUpperCase() + word.slice(1);
      return word;
    }
    function options(seg) {
      const g = GROUPS[seg.g];
      const first = g.indexOf(seg.key);
      const ordered = [g[first], ...g.filter((_, k) => k !== first)];
      return ordered.map(w => caseLike(seg.orig, w));
    }
    function combos(segs) { return segs.filter(s => s.t === 'g').reduce((n, s) => n * BigInt(GROUPS[s.g].length), 1n); }
    function fmtBig(n) {
      if (n < 1000000000n) return Number(n).toLocaleString('en-US');
      const s = n.toString(); const e = s.length - 1;
      return s[0] + '.' + s.slice(1, 3) + ' × 10^' + e;
    }

    /* ---------- versions ---------- */
    function buildVersions(segs) {
      const slots = segs.filter(s => s.t === 'g');
      const total = combos(segs);
      const target = total < BigInt(N_VERSIONS) ? Number(total) : N_VERSIONS;
      const seen = new Set(), out = [];
      let guard = 0;
      while (out.length < target && guard++ < 20000) {
        const pick = slots.map(s => Math.floor(Math.random() * GROUPS[s.g].length));
        const key = pick.join(',');
        if (seen.has(key)) continue;
        seen.add(key); out.push(pick);
      }
      return out.map(pick => {
        let k = 0; const parts = [];
        segs.forEach(s => {
          if (s.t === 'x') parts.push({ s: s.s });
          else { const opts = options(s); const idx = pick[k++]; parts.push({ s: opts[idx], g: s.g, changed: idx !== 0 }); }
        });
        return { parts, pick, text: parts.map(p => p.s).join('') };
      });
    }

    /* ---------- detectors ---------- */
    const words = str => (str.toLowerCase().match(/[a-z][a-z'-]*/g) || []);
    function shingles(arr, k) {
      const set = new Set();
      if (arr.length <= k) { set.add(arr.join(' ')); return set; }
      for (let i = 0; i + k <= arr.length; i++) set.add(arr.slice(i, i + k).join(' '));
      return set;
    }
    function jaccard(a, b) { let inter = 0; a.forEach(x => { if (b.has(x)) inter++; }); const u = a.size + b.size - inter; return u ? inter / u : 1; }
    function matrix(sets) {
      const n = sets.length, m = Array.from({ length: n }, () => new Float32Array(n));
      for (let i = 0; i < n; i++) { m[i][i] = 1; for (let j = i + 1; j < n; j++) { const v = jaccard(sets[i], sets[j]); m[i][j] = m[j][i] = v; } }
      return m;
    }
    function summarize(m, threshold) {
      const n = m.length; let sum = 0, pairs = 0, flagged = 0;
      for (let i = 0; i < n; i++) { let mx = 0; for (let j = 0; j < n; j++) { if (i === j) continue; mx = Math.max(mx, m[i][j]); if (j > i) { sum += m[i][j]; pairs++; } } if (n > 1 && mx >= threshold) flagged++; }
      return { avg: pairs ? sum / pairs : 0, flagged };
    }
    function detect(vs) {
      const norm = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
      const exactM = vs.map(a => vs.map(b => (norm(a.text) === norm(b.text) ? 1 : 0)));
      const w = vs.map(v => words(v.text));
      const shM = matrix(w.map(x => shingles(x, 3)));
      const skM = matrix(w.map(x => shingles(x.map(t => (STOP.has(t) ? t : '·')), 4)));
      const nmM = matrix(vs.map(v => shingles(v.parts.flatMap(p => (p.g != null ? ['g' + p.g] : words(p.s))), 3)));
      return {
        exact: { name: 'Exact match', m: exactM, th: 1, ...summarize(exactM, 1), note: 'identical copies after lowercasing' },
        shingle: { name: 'Word 3-gram overlap', m: shM, th: .5, ...summarize(shM, .5), note: 'flag at ≥50% shared three-word shingles' },
        skeleton: { name: 'Sentence skeleton', m: skM, th: .8, ...summarize(skM, .8), note: 'function words kept, content words blanked; flag at ≥80%' },
        normal: { name: 'Synonym-normalised', m: nmM, th: .8, ...summarize(nmM, .8), note: 'synonyms mapped to one token; flag at ≥80%' }
      };
    }

    /* ---------- stage 1: explode ---------- */
    async function start() {
      const value = text.value.trim();
      if (!value) { showErr('Paste a sentence first.'); return; }
      const segs = parse(value);
      const nSlots = segs.filter(s => s.t === 'g').length;
      if (nSlots < 2) { showErr(`${nSlots ? 'Only one spinnable word' : 'No spinnable words'} found. This machine knows common marketing words like best, cheap, fast, help, website and customers. Try the random example.`); return; }
      const my = ++run; model = segs; results = null;
      go.disabled = true; text.readOnly = true; err.hidden = true;
      stage.hidden = false; ['[data-spx-step2]', '[data-spx-machine]', '[data-spx-output]', '[data-spx-step3]', '[data-spx-detect]'].forEach(s => { $(s).hidden = true; });
      explode.replaceChildren(); list.replaceChildren(); combosEl.textContent = '1'; comboNote.textContent = '';
      const nodes = segs.map(s => { const e = make('span', 'w' + (s.t === 'g' ? ' slot' : ''), s.t === 'g' ? s.orig : s.s); explode.append(e); return e; });
      $('[data-spx-explode-status]').textContent = `scanning ${words(value).length} words`;
      stage.scrollIntoView({ block: 'nearest', behavior: reduced.matches ? 'auto' : 'smooth' });
      await sleep(500);
      const gap = Math.max(60, Math.min(170, 2600 / nSlots));
      let n = 1n, done = 0;
      for (let i = 0; i < segs.length; i++) {
        if (my !== run) return;
        const s = segs[i]; if (s.t !== 'g') continue;
        nodes[i].classList.add('flash'); await sleep(gap * .45);
        const g = make('span', 'g'); g.append(make('span', 'br', '{'));
        options(s).forEach((o, k) => { if (k) g.append(make('span', 'pp', '|')); g.append(make('span', 'o' + (k % 6), o)); });
        g.append(make('span', 'br', '}'));
        nodes[i].replaceWith(g); nodes[i] = g;
        n *= BigInt(GROUPS[s.g].length); done++;
        combosEl.textContent = fmtBig(n);
        $('[data-spx-explode-status]').textContent = `${done} of ${nSlots} phrases spun`;
        await sleep(gap * .55);
      }
      comboNote.textContent = n < BigInt(N_VERSIONS) ? `Only ${n} combinations exist, so the machine will print all of them.` : 'A spinner sells every one of these as a "unique" article.';
      await sleep(350); if (my !== run) return;
      buildReels(segs);
      $('[data-spx-step2]').hidden = false; $('[data-spx-machine]').hidden = false;
      lever.disabled = false; lever.classList.remove('pulled');
      if (reduced.matches) lever.focus({ preventScroll: true });
    }
    function showErr(msg) { err.textContent = msg; err.hidden = false; }

    /* ---------- stage 2: reels ---------- */
    let reels = [];
    function buildReels(segs) {
      reelsEl.replaceChildren(); reels = [];
      segs.forEach(s => {
        if (s.t === 'x') { reelsEl.append(document.createTextNode(s.s)); return; }
        const opts = options(s);
        const r = make('span', 'spx-reel');
        opts.forEach(o => r.append(make('span', 'sz', o)));
        const strip = make('span', 'strip'); strip.append(make('span', '', opts[0]));
        r.append(strip); reelsEl.append(r);
        reels.push({ el: r, strip, opts });
      });
    }
    function spinTo(pick, slow) {
      return Promise.all(reels.map((r, i) => new Promise(res => {
        const spins = slow ? 10 + i * 2 : 3;
        const seq = []; for (let k = 0; k < spins; k++) seq.push(r.opts[Math.floor(Math.random() * r.opts.length)]);
        seq.unshift(r.strip.lastChild ? r.strip.lastChild.textContent : r.opts[0]);
        seq.push(r.opts[pick[i]]);
        r.el.classList.remove('done');
        r.strip.style.transition = 'none'; r.strip.style.transform = 'translateY(0)';
        r.strip.replaceChildren(...seq.map(w => make('span', '', w)));
        if (reduced.matches) { r.strip.style.transform = `translateY(-${(seq.length - 1) * 1.7}em)`; r.el.classList.add('done'); res(); return; }
        void r.strip.offsetHeight;
        const dur = slow ? 900 + i * 140 : 160;
        r.strip.style.transition = `transform ${dur}ms cubic-bezier(.12,.8,.3,1.06)`;
        r.strip.style.transform = `translateY(-${(seq.length - 1) * 1.7}em)`;
        setTimeout(() => { r.el.classList.add('done'); res(); }, dur + 20);
      })));
    }
    function renderLine(v) {
      const li = make('li');
      v.parts.forEach(p => { if (p.changed) li.append(make('mark', '', p.s)); else li.append(document.createTextNode(p.s)); });
      return li;
    }
    lever.addEventListener('click', async () => {
      if (lever.disabled || !model) return;
      const my = run; lever.disabled = true; lever.classList.add('pulled');
      setTimeout(() => lever.classList.remove('pulled'), 450);
      versions = buildVersions(model);
      list.replaceChildren(); $('[data-spx-output]').hidden = false; outCount.textContent = '00 / ' + versions.length;
      await spinTo(versions[0].pick, true); if (my !== run) return;
      for (let i = 0; i < versions.length; i++) {
        if (my !== run) return;
        if (i > 0 && i % 4 === 0) spinTo(versions[i].pick, false);
        list.append(renderLine(versions[i])); list.scrollTop = list.scrollHeight;
        outCount.textContent = String(i + 1).padStart(2, '0') + ' / ' + versions.length;
        await sleep(i < 6 ? 180 : 45);
      }
      await spinTo(versions[versions.length - 1].pick, false);
      await sleep(300); if (my !== run) return;
      runDetect(my);
    });

    /* ---------- stage 3: detect ---------- */
    async function runDetect(my) {
      results = detect(versions);
      const n = versions.length;
      $('[data-spx-step3]').hidden = false; $('[data-spx-detect]').hidden = false;
      const box = $('[data-spx-detectors]'); box.replaceChildren();
      $('[data-spx-verdict]').replaceChildren(); $('[data-spx-sourcebox]').hidden = true;
      $('[data-spx-source]').setAttribute('aria-expanded', 'false'); $('[data-spx-source]').textContent = 'Show spintax source';
      heatMode = 'shingle'; buildHeatToggle();
      $('[data-spx-step3]').scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' });
      drawHeat(true);
      const W = 25;
      for (const key of ['exact', 'shingle', 'skeleton', 'normal']) {
        if (my !== run) return;
        const d = results[key];
        const row = make('div', 'spx-det');
        const top = make('div', 'spx-det-top'); top.append(make('b', '', d.name)); const res = make('span', 'res', 'scanning…'); top.append(res);
        const bar = make('div', 'spx-det-bar'); const note = make('div', 'spx-det-note', `${d.note} · average pair similarity ${(d.avg * 100).toFixed(0)}%`);
        row.append(top, bar, note); box.append(row);
        const fill = Math.round(d.flagged / n * W);
        for (let k = 0; k <= fill; k++) { bar.innerHTML = '█'.repeat(k) + '<i>' + '░'.repeat(W - k) + '</i>'; await sleep(28); }
        bar.innerHTML = '█'.repeat(fill) + '<i>' + '░'.repeat(W - fill) + '</i>';
        res.textContent = `${d.flagged}/${n} flagged`; res.className = 'res ' + (d.flagged ? 'caught' : 'passed');
        await sleep(220);
      }
      if (my !== run) return;
      const best = Math.max(results.normal.flagged, results.skeleton.flagged, results.shingle.flagged, results.exact.flagged);
      const v = $('[data-spx-verdict]');
      const stamp = make('div', 'spx-stamp' + (best ? '' : ' pass'), best ? 'CAUGHT' : 'SLIPPED THROUGH');
      const exactPass = results.exact.flagged === 0;
      const p = make('p', '', best
        ? `${exactPass ? 'Every version passes the exact-match check, ' : ''}but the structural checks see through it: ${results.normal.flagged} of ${n} versions are near-copies once synonyms are normalised, and ${results.skeleton.flagged} of ${n} share the same sentence skeleton. Swapping words changes the surface, not the text.`
        : 'None of these four simple checks flagged the output. That usually means very few words were spun. It does not make the pages useful, and scaled content abuse is judged on purpose and value, not only on detectability.');
      v.append(stamp, p);
      go.disabled = false; text.readOnly = false;
      if (best && heatMode === 'shingle') {
        await sleep(900); if (my !== run) return;
        heatMode = 'normal';
        $('[data-spx-heat-toggle]').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.textContent === 'normalised')));
        drawHeat(true);
      }
    }

    /* ---------- heatmap ---------- */
    const STOPS = [[20, 13, 6], [90, 26, 61], [255, 93, 177], [255, 176, 0], [255, 242, 204]];
    function color(v) {
      const x = Math.max(0, Math.min(1, v)) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i;
      const a = STOPS[i], b = STOPS[i + 1];
      return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
    }
    const HEAT_LABEL = { exact: '(exact match)', shingle: '(word 3-gram overlap)', skeleton: '(sentence skeleton)', normal: '(synonym-normalised)' };
    function buildHeatToggle() {
      const t = $('[data-spx-heat-toggle]'); t.replaceChildren();
      [['exact', 'exact'], ['shingle', '3-gram'], ['skeleton', 'skeleton'], ['normal', 'normalised']].forEach(([k, label]) => {
        const b = make('button', '', label); b.type = 'button'; b.setAttribute('aria-pressed', String(k === heatMode));
        b.addEventListener('click', () => { heatMode = k; t.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); drawHeat(true); });
        t.append(b);
      });
    }
    let heatJob = 0;
    async function drawHeat(animate) {
      if (!results) return;
      const job = ++heatJob, m = results[heatMode].m, n = m.length;
      $('[data-spx-heat-mode]').textContent = HEAT_LABEL[heatMode];
      const size = 300, cell = size / n;
      heat.width = size; heat.height = size;
      hctx.fillStyle = '#050302'; hctx.fillRect(0, 0, size, size);
      for (let i = 0; i < n; i++) {
        if (job !== heatJob) return;
        for (let j = 0; j < n; j++) { hctx.fillStyle = color(m[i][j]); hctx.fillRect(Math.floor(j * cell), Math.floor(i * cell), Math.ceil(cell), Math.ceil(cell)); }
        if (animate && !reduced.matches && i % 2) await new Promise(r => requestAnimationFrame(r));
      }
    }

    /* ---------- controls ---------- */
    go.addEventListener('click', start);
    text.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); start(); } });
    $('[data-spx-example]').addEventListener('click', () => {
      if (text.readOnly) return;
      exampleIx = (exampleIx + 1 + Math.floor(Math.random() * (EXAMPLES.length - 1))) % EXAMPLES.length;
      text.value = EXAMPLES[exampleIx]; updateChars(); err.hidden = true;
    });
    $('[data-spx-reset]').addEventListener('click', () => {
      run++; stage.hidden = true; go.disabled = false; text.readOnly = false; results = null; model = null;
      text.focus(); text.scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
    });
    $('[data-spx-source]').addEventListener('click', () => {
      const box = $('[data-spx-sourcebox]'), b = $('[data-spx-source]');
      box.hidden = !box.hidden; b.setAttribute('aria-expanded', String(!box.hidden));
      b.textContent = box.hidden ? 'Show spintax source' : 'Hide spintax source';
      if (!box.hidden && model) box.textContent = model.map(s => (s.t === 'x' ? s.s : '{' + options(s).join('|') + '}')).join('');
    });
    root.dataset.state = 'idle';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
