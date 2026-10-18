
/* Link Juice Simulator: classic PageRank sandbox with particle flow and a footprint sweep. No network requests. */
(function () {
'use strict';
function init() {
const root = document.querySelector('[data-ljs]');
if (!root || root.dataset.ready) return;
root.dataset.ready = '1';

const CHAPTERS = {
  links:    { label: 'Search Manipulation', file: 'search-manipulation.html' },
  pbn:      { label: 'Private Blog Networks', file: 'private-blog-networks.html' },
  parasite: { label: 'Parasite SEO', file: 'parasite-seo.html' },
  detect:   { label: 'Detection & Defense', file: 'detection-defense.html' }
};
const BHT = window.BHT || {};
function chapterHref(file) {
  if (!BHT.inline) return (BHT.base || './') + file;
  const page = (BHT.pages || []).find(p => p.originalFile === file);
  return page ? page.file : '#';
}

const TYPES = {
  money:     { c: '#ffb000', name: 'money site' },
  page:      { c: '#33ff99', name: 'page' },
  authority: { c: '#4fd6ee', name: 'authority site' },
  pbn:       { c: '#ff5db1', name: 'pbn domain' },
  web2:      { c: '#b98cff', name: 'web 2.0 property' },
  farm:      { c: '#ff7a1a', name: 'link farm member' },
  ghost:     { c: '#a8977a', name: 'legacy backlinks' }
};
const DEFAULT_FP = {
  pbn:  [0.8,  ['shared host / IP block', 'same registrar + WHOIS privacy', 'links only to your money site']],
  web2: [0.7,  ['thin spun content', 'created in the same week', 'every post links to the same target']],
  farm: [0.85, ['reciprocal links with every member', 'no links to real sites', 'identical anchor text']]
};
const D = 0.85;
const SPAWN = 75;           // particles per unit of flow per second
const MAXP = 700;
const SPEED = 150;          // px per second
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = s => root.querySelector(s);
const $$ = s => Array.from(root.querySelectorAll(s));
const cv = $('[data-ljs-canvas]'), ctx = cv.getContext('2d');
const stage = $('[data-ljs-stage]'), tip = $('[data-ljs-tip]'), hud = $('[data-ljs-hud]'), logEl = $('[data-ljs-log]');
const MONO = getComputedStyle(root).fontFamily;
let visible = true;

let W = 800, H = 520, DPR = 1, PAD = { l: 40, r: 40, t: 40, b: 34 }, RS = 1;
let nodes = [], edges = [], particles = [], pr = new Map(), stats = {};
let mode = 'move', linkFrom = null, drag = null, hover = null, hoverEdge = null;
let legacyNF = false;
let mouse = { x: -99, y: -99 }, paused = false, sweeping = null, uid = 0, scenarioKey = 'pbn';
const t0 = performance.now();

/* ---------- model helpers ---------- */
function N(id, label, type, nx, ny, fp, notes, seed) {
  if (fp === undefined && DEFAULT_FP[type]) { fp = DEFAULT_FP[type][0]; notes = DEFAULT_FP[type][1]; }
  return { id, label, type, nx, ny, fp: fp || 0, notes: notes || [],
    seed: seed != null ? seed : (type === 'authority' ? 5 : type === 'ghost' ? 4 : 1),
    flagged: false, pulse: 0 };
}
function E(s, t, nf) { return { s, t, nofollow: !!nf, devalued: false, acc: Math.random() }; }
const byId = id => nodes.find(n => n.id === id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const chap = k => { const c = CHAPTERS[k]; if (!c) return ''; return `<a href="${esc(chapterHref(c.file))}">${esc(c.label)}</a>`; };

/* ---------- scenarios ---------- */
const SCENARIOS = {
  organic: {
    name: 'natural web',
    title: 'The natural web',
    brief: `A link passes juice equal to the linking page's rank <b>divided by its number of outbound links</b>. One link from a strong page beats a pile of weak ones.`,
    tryit: 'Try: [3] + link, then drag from big-news.com to your-site.com. Watch the money node swell.',
    read: 'links',
    build() {
      return {
        nodes: [
          N('news', 'big-news.com', 'authority', .16, .22, 0, [], 6),
          N('niche', 'niche-blog.net', 'page', .18, .76),
          N('forum', 'forum.org', 'page', .44, .14),
          N('money', 'your-site.com', 'money', .6, .5),
          N('blog', 'your-site/blog', 'page', .86, .28),
          N('prod', 'your-site/product', 'page', .86, .74),
          N('partner', 'partner.io', 'page', .42, .86)
        ],
        edges: [
          E('news', 'niche'), E('news', 'forum'), E('niche', 'money'), E('forum', 'money'), E('forum', 'news'),
          E('niche', 'news'), E('money', 'blog'), E('money', 'prod'), E('blog', 'money'), E('prod', 'money'),
          E('blog', 'prod'), E('partner', 'money'), E('money', 'partner')
        ]
      };
    }
  },
  pbn: {
    name: 'pbn',
    title: 'Private blog network',
    brief: `Expired domains keep the juice from their <b>old backlinks</b>. A PBN buys them and funnels that juice into one money site. The links work. The <b>footprints</b> are what get a network killed.`,
    tryit: 'Try: hover each PBN to see its footprint, then hit [S]. Notice which one survives and why.',
    read: 'pbn',
    build() {
      const shared = ['shared IP 104.21.44.x', 'same registrar + WHOIS privacy', 'identical theme + plugins'];
      return {
        nodes: [
          N('g1', 'legacy links', 'ghost', .08, .12), N('g2', 'legacy links', 'ghost', .08, .31),
          N('g3', 'legacy links', 'ghost', .08, .5),  N('g4', 'legacy links', 'ghost', .08, .69),
          N('g5', 'legacy links', 'ghost', .08, .88),
          N('p1', 'drop-bakery.com', 'pbn', .42, .12, .85, shared),
          N('p2', 'old-lawfirm.net', 'pbn', .42, .31, .8, shared),
          N('p3', 'retro-games.org', 'pbn', .42, .5, .9, ['shared IP 104.21.44.x', 'every post links to your-site.com', 'zero outbound links to anyone else']),
          N('p4', 'city-bikes.co', 'pbn', .42, .69, .75, ['same Cloudflare account', 'same Analytics + AdSense ID']),
          N('p5', 'hiking-log.com', 'pbn', .42, .88, .2, ['unique host + IP', 'real topical content, updated', 'links out to many real sites']),
          N('money', 'your-site.com', 'money', .8, .5),
          N('local', 'local-news.org', 'authority', .82, .13, 0, [], 3),
          N('offer', 'your-site/offer', 'page', .84, .86)
        ],
        edges: [
          E('g1', 'p1'), E('g2', 'p2'), E('g3', 'p3'), E('g4', 'p4'), E('g5', 'p5'),
          E('p1', 'money'), E('p2', 'money'), E('p3', 'money'), E('p4', 'money'), E('p5', 'money'), E('p5', 'local'),
          E('local', 'money'), E('money', 'offer'), E('offer', 'money')
        ]
      };
    }
  },
  wheel: {
    name: 'link wheel',
    title: 'Web 2.0 link wheel',
    brief: `Each Web 2.0 property links to the next one <b>and</b> to your site. The ring recycles its own juice, so it looks like rank from nowhere. In practice it is mostly <b>teleport juice</b>, and a perfect ring is an easy pattern to spot.`,
    tryit: 'Try: delete one spoke with [5] and see how little the money site loses. Then run [S].',
    read: 'links',
    build() {
      const n = [N('money', 'your-site.com', 'money', .5, .5)], e = [];
      const k = 6;
      for (let i = 0; i < k; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / k;
        n.push(N('w' + i, 'web2-prop-' + (i + 1), 'web2', .5 + .33 * Math.cos(a), .5 + .38 * Math.sin(a)));
        e.push(E('w' + i, 'w' + ((i + 1) % k)), E('w' + i, 'money'));
      }
      return { nodes: n, edges: e };
    }
  },
  sculpt: {
    name: 'nofollow sculpting',
    title: 'PageRank sculpting',
    brief: `The old trick: nofollow your unimportant links so juice "concentrates" on the pages you care about. It worked until 2009. Since then Google divides by <b>all</b> links and the nofollowed share simply <b>evaporates</b>, so sculpting throws juice away instead of redirecting it.`,
    tryit: 'Try: press [M] to flip to the pre-2009 model and watch /product jump. Flip back and it falls while the leak meter fills. Then try [5] deleting junk links instead.',
    read: 'links',
    build() {
      const junk = [['login', .1, .2], ['terms', .08, .42], ['privacy', .1, .64], ['cart', .2, .86], ['careers', .38, .9], ['contact', .56, .9], ['sitemap', .24, .08]];
      const n = [
        N('home', 'your-site/home', 'money', .34, .48),
        N('mag', 'industry-mag.com', 'authority', .62, .1, 0, [], 5),
        N('prod', '/product', 'page', .82, .3), N('svc', '/services', 'page', .86, .55), N('price', '/pricing', 'page', .8, .8)
      ];
      const e = [E('mag', 'home'), E('home', 'prod'), E('home', 'svc'), E('home', 'price'), E('prod', 'home'), E('svc', 'home'), E('price', 'home')];
      junk.forEach(([id, x, y]) => { n.push(N(id, '/' + id, 'page', x, y)); e.push(E('home', id, true), E(id, 'home')); });
      return { nodes: n, edges: e };
    }
  },
  farm: {
    name: 'link farm',
    title: 'Link farm',
    brief: `Farm members link to <b>each other</b> and to the paying site. Rank circulates inside the cluster and inflates it, but that density is the <b>footprint</b>: nobody links like this naturally.`,
    tryit: 'Try: watch juice loop inside the cluster, then run [S] and check the money site delta in the log.',
    read: 'detect',
    build() {
      const n = [N('money', 'your-site.com', 'money', .86, .5), N('offer', 'your-site/offer', 'page', .86, .84)], e = [E('money', 'offer'), E('offer', 'money')];
      const k = 6;
      for (let i = 0; i < k; i++) {
        const a = i * 2 * Math.PI / k;
        n.push(N('f' + i, 'farm-' + (i + 1) + '.xyz', 'farm', .38 + .24 * Math.cos(a), .5 + .34 * Math.sin(a)));
      }
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) if (i !== j) e.push(E('f' + i, 'f' + j));
        e.push(E('f' + i, 'money'));
      }
      e.push(E('money', 'f0'));
      return { nodes: n, edges: e };
    }
  },
  parasite: {
    name: 'parasite page',
    title: 'Parasite SEO',
    brief: `Rent one page on a trusted domain and it inherits the host's <b>internal link equity</b>. That page then links to you. Google's <b>site reputation abuse</b> policy (announced March 2024) targets exactly this.`,
    tryit: 'Try: compare the partner page to /news, then run [S] to apply the policy.',
    read: 'parasite',
    build() {
      return {
        nodes: [
          N('host', 'big-publisher.com', 'authority', .18, .5, 0, [], 8),
          N('news', '/news', 'page', .46, .14), N('rev', '/reviews', 'page', .48, .36), N('sport', '/sports', 'page', .46, .58),
          N('para', '/partner/best-x-2026', 'page', .5, .84, .8, ['off-topic for the host site', 'third-party content, host has little oversight', 'exists to rank + link out']),
          N('money', 'your-site.com', 'money', .84, .6), N('offer', 'your-site/offer', 'page', .86, .88)
        ],
        edges: [
          E('host', 'news'), E('host', 'rev'), E('host', 'sport'), E('host', 'para'),
          E('news', 'host'), E('rev', 'host'), E('sport', 'host'), E('para', 'host'),
          E('para', 'money'), E('money', 'offer'), E('offer', 'money')
        ]
      };
    }
  },
  sandbox: {
    name: 'sandbox',
    title: 'Sandbox',
    brief: `Blank graph. <b>Build your own scheme</b> and see if it survives a sweep. Nodes you add as pbn, web 2.0 or farm get realistic footprints by default.`,
    tryit: 'Try: [2] + node, choose a type, click empty space. Then [3] to wire them up.',
    read: 'detect',
    build() {
      return {
        nodes: [N('money', 'your-site.com', 'money', .62, .5), N('auth', 'authority.org', 'authority', .2, .3)],
        edges: []
      };
    }
  }
};

/* ---------- pagerank ---------- */
/* 2009+ model: every outbound link counts in the divisor, nofollowed share evaporates.
   pre-2009 model: nofollow links are ignored entirely, so the followed links split all the juice. */
const counts = e => !(legacyNF && e.nofollow);
function divisorOf(id) { let k = 0; edges.forEach(e => { if (e.s === id && counts(e)) k++; }); return k; }
function computePR() {
  const n = nodes.length; pr = new Map();
  if (!n) { stats = { total: 0, leak: 0, iters: 0, n: 0 }; return; }
  const seedSum = nodes.reduce((a, x) => a + x.seed, 0);
  const out = new Map(nodes.map(x => [x.id, []]));
  edges.forEach(e => { const o = out.get(e.s); if (o) o.push(e); });
  let cur = new Map(nodes.map(x => [x.id, x.seed / seedSum]));
  let leak = 0, it = 0;
  for (; it < 300; it++) {
    const nx = new Map(); let dang = 0; leak = 0;
    nodes.forEach(x => nx.set(x.id, (1 - D) * x.seed / seedSum));
    nodes.forEach(x => {
      const o = out.get(x.id).filter(counts), p = cur.get(x.id);
      if (!o.length) { dang += p; return; }
      const sh = D * p / o.length;
      o.forEach(e => { if (e.nofollow || e.devalued) leak += sh; else nx.set(e.t, nx.get(e.t) + sh); });
    });
    if (dang) nodes.forEach(x => nx.set(x.id, nx.get(x.id) + D * dang * x.seed / seedSum));
    let diff = 0; nodes.forEach(x => { diff += Math.abs(nx.get(x.id) - cur.get(x.id)); });
    cur = nx;
    if (diff < 1e-10) break;
  }
  pr = cur;
  let total = 0; cur.forEach(v => { total += v; });
  stats = { total, leak, iters: it + 1, n };
}
const juice = nd => (pr.get(nd.id) || 0) * 100;
const moneyNode = () => nodes.find(n => n.type === 'money');

/* ---------- geometry ---------- */
const P = nd => ({ x: PAD.l + nd.nx * (W - PAD.l - PAD.r), y: PAD.t + nd.ny * (H - PAD.t - PAD.b) });
const toN = m => ({ nx: (m.x - PAD.l) / (W - PAD.l - PAD.r), ny: (m.y - PAD.t) / (H - PAD.t - PAD.b) });
function rad(nd) {
  const v = (pr.get(nd.id) || 0) * Math.max(1, nodes.length);
  return Math.min(46, 8 + 12 * Math.sqrt(v)) * RS;
}
function trim(p, toward, r) {
  const dx = toward.x - p.x, dy = toward.y - p.y, l = Math.hypot(dx, dy) || 1;
  return { x: p.x + dx / l * r, y: p.y + dy / l * r };
}
function geom(e) {
  const a = byId(e.s), b = byId(e.t); if (!a || !b) return null;
  const pa = P(a), pb = P(b);
  const dx = pb.x - pa.x, dy = pb.y - pa.y, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const rev = edges.some(f => f.s === e.t && f.t === e.s);
  const off = rev ? Math.min(22, len * .12) : 0;
  const c = { x: (pa.x + pb.x) / 2 - uy * off, y: (pa.y + pb.y) / 2 + ux * off };
  const p0 = trim(pa, c, rad(a) + 1), p1 = trim(pb, c, rad(b) + 5);
  return { p0, c, p1, len: Math.max(20, Math.hypot(p1.x - p0.x, p1.y - p0.y)) };
}
function bz(g, t) {
  const u = 1 - t;
  return { x: u * u * g.p0.x + 2 * u * t * g.c.x + t * t * g.p1.x, y: u * u * g.p0.y + 2 * u * t * g.c.y + t * t * g.p1.y };
}
function hitNode(m) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const nd = nodes[i], p = P(nd);
    if (Math.hypot(m.x - p.x, m.y - p.y) <= rad(nd) + 5) return nd;
  }
  return null;
}
function hitEdge(m) {
  let best = null, bd = 8;
  edges.forEach(e => {
    const g = geom(e); if (!g) return;
    for (let t = 0; t <= 1; t += .04) { const q = bz(g, t), d = Math.hypot(q.x - m.x, q.y - m.y); if (d < bd) { bd = d; best = e; } }
  });
  return best;
}

/* ---------- log ---------- */
function log(msg, cls) {
  const s = ((performance.now() - t0) / 1000).toFixed(1).padStart(6, ' ');
  const div = document.createElement('div');
  div.innerHTML = `<span class="ts">[${s}s]</span> <span class="${cls || 'info'}">${esc(msg)}</span>`;
  logEl.appendChild(div);
  while (logEl.children.length > 120) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
}

/* ---------- panel ---------- */
function renderScenarios() {
  const box = $('[data-ljs-scenarios]'); box.innerHTML = '';
  Object.entries(SCENARIOS).forEach(([k, s]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ljs-btn';
    b.textContent = s.name; b.setAttribute('aria-pressed', k === scenarioKey);
    b.onclick = () => load(k); box.appendChild(b);
  });
}
function renderBrief() {
  const s = SCENARIOS[scenarioKey];
  $('[data-ljs-brief]').innerHTML = `<div class="ljs-h">// BRIEFING</div><p class="ljs-title">${esc(s.title)}</p><p>${s.brief}</p><p class="ljs-try">&gt; ${esc(s.tryit)}</p><p class="ljs-read">read more: ${chap(s.read)}</p>`;
}
function renderTable() {
  const rows = [...nodes].sort((a, b) => (pr.get(b.id) || 0) - (pr.get(a.id) || 0));
  const max = Math.max(1e-9, ...rows.map(r => pr.get(r.id) || 0));
  const W14 = 14;
  let html = `<div class="row hd"><span class="nm">NODE</span><span class="v">JUICE</span><span class="b"></span></div>`;
  html += rows.map(nd => {
    const v = juice(nd), bars = Math.round((pr.get(nd.id) || 0) / max * W14);
    const col = nd.flagged ? '#ff4a3d' : TYPES[nd.type].c;
    return `<div class="row ${nd.type}${nd.flagged ? ' flagged' : ''}"><span class="nm" title="${esc(nd.label)}">${esc(nd.label)}</span><span class="v">${v.toFixed(1)}</span><span class="b" style="color:${col}">${'█'.repeat(bars)}<i>${'░'.repeat(W14 - bars)}</i></span></div>`;
  }).join('');
  $('[data-ljs-tbl]').innerHTML = html;
  const nf = edges.filter(e => e.nofollow).length, dv = edges.filter(e => e.devalued).length;
  const m = moneyNode();
  const leakPct = stats.total ? stats.leak / (stats.leak + stats.total) * 100 : 0;
  const lb = Math.round(clamp(leakPct, 0, 100) / 100 * 12);
  $('[data-ljs-meters]').innerHTML =
    (m ? `<div><span>money site juice</span><b style="color:#ffb000">${juice(m).toFixed(1)}</b></div>` : '') +
    `<div><span>juice kept in graph</span><b>${(stats.total * 100).toFixed(1)} / 100</b></div>` +
    `<div class="leak"><span>evaporating per cycle</span><b>${'▮'.repeat(lb)}${'▯'.repeat(12 - lb)} ${(stats.leak * 100).toFixed(1)}</b></div>` +
    `<div><span>links</span><b>${edges.length} (${nf} nofollow, ${dv} devalued)</b></div>` +
    `<div><span>solver</span><b>${stats.iters} iterations, d=${D}</b></div>`;
}
const HINTS = {
  move: 'drag nodes to rearrange', add: 'click empty space to drop a node', link: 'click a source, then a target',
  nofollow: 'click a link to toggle rel=nofollow', delete: 'click a node or link to remove it'
};
function renderHud() {
  hud.innerHTML = `<span>mode: <b>${mode.toUpperCase()}</b></span><span>${HINTS[mode]}${mode === 'link' && linkFrom ? ' (source: ' + esc(linkFrom.label) + ')' : ''}</span>` +
    `<span>nofollow: <b>${legacyNF ? 'PRE-2009' : '2009+'}</b></span>` + (paused ? '<span class="ljs-warn">FLOW PAUSED</span>' : '') + (sweeping ? '<span class="ljs-warn">SWEEP IN PROGRESS</span>' : '');
}
function setMode(m) {
  mode = m; linkFrom = null;
  $$('[data-ljs-modes] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  $('[data-ljs-addrow]').hidden = m !== 'add';
  renderHud();
}
function refresh() { computePR(); renderTable(); renderHud(); }

/* ---------- actions ---------- */
function load(k) {
  scenarioKey = k; const g = SCENARIOS[k].build();
  nodes = g.nodes; edges = g.edges; particles = []; linkFrom = null; sweeping = null; uid = nodes.length;
  refresh(); renderScenarios(); renderBrief();
  log(`$ load --scenario=${k}`, 'cmd');
  const m = moneyNode();
  log(`graph: ${nodes.length} nodes, ${edges.length} links. pagerank converged in ${stats.iters} iterations.` + (m ? ` money site juice ${juice(m).toFixed(1)}` : ''), 'info');
}
function addNode(m) {
  const type = $('[data-ljs-addtype]').value; uid++;
  const label = (type === 'authority' ? 'authority-' : type === 'ghost' ? 'legacy-' : type === 'money' ? 'money-' : type + '-') + uid;
  const q = toN(m);
  const nd = N('u' + uid + '_' + Date.now(), label, type, clamp(q.nx, 0, 1), clamp(q.ny, 0, 1));
  nodes.push(nd); refresh();
  log(`+ node ${label} [${TYPES[type].name}]` + (nd.fp >= .5 ? `  footprints: ${nd.notes.join(', ')}` : ''), 'ok');
}
function addEdge(a, b) {
  if (edges.some(e => e.s === a.id && e.t === b.id)) { log(`link ${a.label} → ${b.label} already exists`, 'info'); return; }
  const before = juice(b);
  edges.push(E(a.id, b.id)); refresh();
  const d = juice(b) - before;
  log(`+ link ${a.label} → ${b.label} [follow]   ${b.label} juice ${before.toFixed(1)} → ${juice(b).toFixed(1)} (${d >= 0 ? '+' : ''}${d.toFixed(1)})`, d >= 0 ? 'ok' : 'bad');
}
function removeNode(nd) {
  nodes = nodes.filter(n => n !== nd); edges = edges.filter(e => e.s !== nd.id && e.t !== nd.id);
  particles = particles.filter(p => edges.includes(p.e)); refresh();
  log(`- node ${nd.label} removed`, 'bad');
}
function removeEdge(e) {
  edges = edges.filter(x => x !== e); particles = particles.filter(p => p.e !== e); refresh();
  log(`- link ${byId(e.s).label} → ${byId(e.t).label} removed`, 'bad');
}
function toggleNofollow(e) {
  const m = moneyNode(), mb = m ? juice(m) : 0, leakB = stats.leak;
  e.nofollow = !e.nofollow; particles = particles.filter(p => p.e !== e); refresh();
  const tgt = byId(e.t);
  log(`~ ${byId(e.s).label} → ${tgt.label} is now ${e.nofollow ? 'rel=nofollow' : 'follow'}.  evaporation ${(leakB * 100).toFixed(1)} → ${(stats.leak * 100).toFixed(1)}` + (m ? `, money site ${mb.toFixed(1)} → ${juice(m).toFixed(1)}` : ''), e.nofollow ? 'bad' : 'ok');
}
function startSweep() {
  if (sweeping || !nodes.length) return;
  const m = moneyNode();
  sweeping = { x: -20, before: m ? juice(m) : 0, hits: 0 };
  nodes.forEach(n => { n._swept = false; });
  log('$ spambrain --sweep --target=graph --mode=footprint', 'cmd');
  renderHud();
}
function sweepStep(dt) {
  sweeping.x += (W + 60) * dt / 2.2;
  nodes.forEach(nd => {
    if (nd._swept || P(nd).x > sweeping.x) return;
    nd._swept = true;
    if (!nd.flagged && nd.fp >= .5) {
      nd.flagged = true; sweeping.hits++;
      edges.forEach(e => { if (e.s === nd.id) e.devalued = true; });
      particles = particles.filter(p => p.e.s !== nd.id);
      computePR(); renderTable();
      log(`✖ ${nd.label}  matched: ${nd.notes.join(' · ')}  → outbound links devalued`, 'bad');
    } else if (!nd.flagged && nd.notes.length && nd.fp < .5) {
      log(`✔ ${nd.label}  passed: ${nd.notes.join(' · ')}`, 'ok');
    }
  });
  if (sweeping.x > W + 40) {
    const m = moneyNode(), after = m ? juice(m) : 0, b = sweeping.before;
    if (!sweeping.hits) log('sweep complete. no footprints matched. graph reads as natural.', 'ok');
    else log(`sweep complete. ${sweeping.hits} node(s) flagged. money site juice ${b.toFixed(1)} → ${after.toFixed(1)} (${b ? ((after - b) / b * 100).toFixed(0) : 0}%)`, 'hi');
    nodes.forEach(n => { delete n._swept; });
    sweeping = null; renderHud();
  }
}

/* ---------- sim loop ---------- */
function step(dt) {
  const outN = new Map(); edges.forEach(e => { if (counts(e)) outN.set(e.s, (outN.get(e.s) || 0) + 1); });
  const rate = SPAWN * (REDUCE ? .3 : 1);
  edges.forEach(e => {
    if (!counts(e)) return;
    const flow = D * (pr.get(e.s) || 0) / (outN.get(e.s) || 1);
    e.acc += flow * rate * dt;
    while (e.acc >= 1) {
      e.acc -= 1;
      if (particles.length < MAXP) particles.push({ e, t: 0, kind: e.devalued ? 'dead' : e.nofollow ? 'nf' : 'ok', life: 1, dy: 0, jit: (Math.random() - .5) * 5 });
    }
  });
  const geoms = new Map();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    let g = geoms.get(p.e); if (g === undefined) { g = geom(p.e); geoms.set(p.e, g); }
    if (!g) { particles.splice(i, 1); continue; }
    const adv = SPEED * dt / g.len;
    if (p.kind === 'ok') {
      p.t += adv;
      if (p.t >= 1) { const tn = byId(p.e.t); if (tn) tn.pulse = Math.min(1, tn.pulse + .12); particles.splice(i, 1); }
    } else if (p.kind === 'nf') {
      if (p.t < .5) p.t += adv; else { p.dy -= 26 * dt; p.life -= dt * 1.1; }
      if (p.life <= 0) particles.splice(i, 1);
    } else {
      if (p.t < .16) p.t += adv * .7; else p.life -= dt * 2.5;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }
  nodes.forEach(n => { n.pulse = Math.max(0, n.pulse - dt * 2.2); });
}

function drawArrow(g, col) {
  const ang = Math.atan2(g.p1.y - g.c.y, g.p1.x - g.c.x), s = 7;
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(g.p1.x + Math.cos(ang) * 3, g.p1.y + Math.sin(ang) * 3);
  ctx.lineTo(g.p1.x - Math.cos(ang - .45) * s, g.p1.y - Math.sin(ang - .45) * s);
  ctx.lineTo(g.p1.x - Math.cos(ang + .45) * s, g.p1.y - Math.sin(ang + .45) * s);
  ctx.closePath(); ctx.fill();
}

function draw(ts) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  // dot grid
  ctx.fillStyle = 'rgba(255,176,0,.07)';
  for (let x = 20; x < W; x += 28) for (let y = 20; y < H; y += 28) ctx.fillRect(x, y, 1, 1);

  // edges
  edges.forEach(e => {
    const g = geom(e); if (!g) return;
    const hl = e === hoverEdge;
    let col = 'rgba(51,255,153,.26)';
    if (e.devalued) col = 'rgba(255,74,61,.55)'; else if (e.nofollow) col = legacyNF ? 'rgba(154,138,112,.25)' : 'rgba(154,138,112,.55)';
    if (hl) col = mode === 'delete' ? '#ff4a3d' : '#ffb000';
    ctx.strokeStyle = col; ctx.lineWidth = hl ? 2.6 : 1.3;
    ctx.setLineDash(e.nofollow || e.devalued ? [5, 5] : []);
    ctx.beginPath(); ctx.moveTo(g.p0.x, g.p0.y); ctx.quadraticCurveTo(g.c.x, g.c.y, g.p1.x, g.p1.y); ctx.stroke();
    ctx.setLineDash([]);
    drawArrow(g, col);
  });

  // particles
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const geoms = new Map();
  particles.forEach(p => {
    let g = geoms.get(p.e); if (g === undefined) { g = geom(p.e); geoms.set(p.e, g); }
    if (!g) return;
    const q = bz(g, Math.min(1, p.t));
    const x = q.x + p.jit * .4, y = q.y + p.dy + p.jit * .4;
    let c1, c2, r = 2.2;
    if (p.kind === 'ok') { c1 = 'rgba(51,255,153,.18)'; c2 = 'rgba(180,255,210,.95)'; }
    else if (p.kind === 'nf') { c1 = `rgba(154,138,112,${.15 * p.life})`; c2 = `rgba(220,200,170,${.8 * p.life})`; r = 1.8 + (1 - p.life) * 1.5; }
    else { c1 = `rgba(255,74,61,${.2 * p.life})`; c2 = `rgba(255,140,120,${.9 * p.life})`; }
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 7); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(x, y, r * .8, 0, 7); ctx.fill();
  });
  ctx.restore();

  // link preview
  if (mode === 'link' && linkFrom) {
    const a = P(linkFrom);
    ctx.strokeStyle = 'rgba(255,176,0,.7)'; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); ctx.setLineDash([]);
  }

  // nodes
  ctx.font = `${W < 600 ? 10 : 11}px ${MONO}`; ctx.textAlign = 'center';
  nodes.forEach(nd => {
    const p = P(nd), r = rad(nd), col = nd.flagged ? '#ff4a3d' : TYPES[nd.type].c;
    ctx.save();
    ctx.shadowColor = col; ctx.shadowBlur = 8 + r * .5 + nd.pulse * 22;
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
    ctx.lineWidth = nd === hover || nd === linkFrom ? 3 : 2; ctx.strokeStyle = col; ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = .18 + nd.pulse * .45; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(p.x, p.y, r * .72, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    if (nd.type === 'money' && !nd.flagged) {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ts / 1400);
      ctx.strokeStyle = 'rgba(255,176,0,.55)'; ctx.setLineDash([4, 6]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, 7); ctx.stroke(); ctx.restore();
    }
    if (nd.flagged) {
      const s = r * .45; ctx.strokeStyle = '#ff4a3d'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(p.x - s, p.y - s); ctx.lineTo(p.x + s, p.y + s); ctx.moveTo(p.x + s, p.y - s); ctx.lineTo(p.x - s, p.y + s); ctx.stroke();
    }
    if (nd === linkFrom) {
      ctx.strokeStyle = '#ffb000'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(p.x, p.y, r + 10, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    const ly = p.y + r + 14, tw = ctx.measureText(nd.label).width;
    const lx = clamp(p.x, tw / 2 + 3, W - tw / 2 - 3);
    ctx.fillStyle = nd.flagged ? '#ff8a7d' : '#e8dcc8';
    ctx.fillText(nd.label, lx, ly);
    ctx.fillStyle = col; ctx.fillText(juice(nd).toFixed(1), lx, ly + 13);
  });

  // sweep beam
  if (sweeping) {
    const x = sweeping.x;
    const gr = ctx.createLinearGradient(x - 90, 0, x, 0);
    gr.addColorStop(0, 'rgba(255,74,61,0)'); gr.addColorStop(1, 'rgba(255,74,61,.22)');
    ctx.fillStyle = gr; ctx.fillRect(x - 90, 0, 90, H);
    ctx.strokeStyle = 'rgba(255,90,70,.95)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    ctx.fillStyle = '#ff4a3d'; ctx.textAlign = 'left';
    ctx.fillText('SPAMBRAIN', Math.min(x + 6, W - 70), 16);
    ctx.textAlign = 'center';
  }
}

let last = performance.now();
function frame(ts) {
  const dt = Math.min(.05, Math.max(0, (ts - last) / 1000)); last = ts;
  if (visible) {
    if (!paused) step(dt);
    if (sweeping) sweepStep(dt);
    draw(ts);
  }
  requestAnimationFrame(frame);
}

/* ---------- tooltip ---------- */
function showTip(nd, m) {
  if (!nd) { tip.hidden = true; return; }
  const outs = edges.filter(e => e.s === nd.id), ins = edges.filter(e => e.t === nd.id);
  const dv = divisorOf(nd.id);
  const each = dv ? (D * (pr.get(nd.id) || 0) / dv * 100).toFixed(2) : '0';
  tip.innerHTML = `<div class="t">${esc(nd.label)}</div>` +
    `<div><span class="k">type</span> ${esc(TYPES[nd.type].name)}${nd.flagged ? ' <span class="bad">[FLAGGED]</span>' : ''}</div>` +
    `<div><span class="k">juice</span> ${juice(nd).toFixed(2)}</div>` +
    `<div><span class="k">links in / out</span> ${ins.length} / ${outs.length}</div>` +
    `<div><span class="k">passes per link</span> ${each}</div>` +
    (nd.notes.length ? `<div class="k" style="margin-top:4px">${nd.fp >= .5 ? 'footprints' : 'profile'}:</div><ul>${nd.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '');
  tip.hidden = false;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  let x = m.x + 16, y = m.y + 16;
  if (x + tw > W - 4) x = m.x - tw - 16;
  if (y + th > H - 4) y = m.y - th - 16;
  tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, y) + 'px';
}

/* ---------- input ---------- */
function pos(ev) { const r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
cv.addEventListener('pointerdown', ev => {
  const m = pos(ev); mouse = m;
  stage.focus({ preventScroll: true });
  const nd = hitNode(m), eg = nd ? null : hitEdge(m);
  switch (mode) {
    case 'move':
      if (nd) { drag = nd; cv.setPointerCapture(ev.pointerId); hover = nd; showTip(nd, m); }
      break;
    case 'add':
      if (nd) { drag = nd; cv.setPointerCapture(ev.pointerId); } else addNode(m);
      break;
    case 'link':
      if (!nd) { linkFrom = null; }
      else if (!linkFrom) { linkFrom = nd; log(`source: ${nd.label}. now pick a target`, 'info'); }
      else if (nd === linkFrom) { linkFrom = null; }
      else { addEdge(linkFrom, nd); linkFrom = null; }
      renderHud();
      break;
    case 'nofollow':
      if (eg) toggleNofollow(eg);
      break;
    case 'delete':
      if (nd) removeNode(nd); else if (eg) removeEdge(eg);
      hover = null; hoverEdge = null; showTip(null);
      break;
  }
});
cv.addEventListener('pointermove', ev => {
  const m = pos(ev); mouse = m;
  if (drag) {
    const q = toN(m); drag.nx = clamp(q.nx, -.02, 1.02); drag.ny = clamp(q.ny, -.02, 1.02);
    showTip(drag, m); return;
  }
  hover = hitNode(m);
  hoverEdge = !hover && (mode === 'nofollow' || mode === 'delete') ? hitEdge(m) : null;
  showTip(hover, m);
  cv.style.cursor = hover ? (mode === 'move' ? 'grab' : 'pointer') : hoverEdge ? 'pointer' : mode === 'add' ? 'crosshair' : 'default';
});
const endDrag = () => { drag = null; };
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);
cv.addEventListener('pointerleave', () => { if (!drag) { hover = null; hoverEdge = null; showTip(null); } });

$$('[data-ljs-modes] button').forEach(b => { b.onclick = () => setMode(b.dataset.mode); });
$('[data-ljs-sweep]').onclick = startSweep;
$('[data-ljs-reset]').onclick = () => load(scenarioKey);
const togglePause = () => { paused = !paused; $('[data-ljs-pause]').setAttribute('aria-pressed', String(paused)); renderHud(); };
$('[data-ljs-pause]').onclick = togglePause;
function toggleModel() {
  const watch = nodes.filter(n => n.type !== 'ghost').sort((a, b) => juice(b) - juice(a)).slice(0, 4);
  const before = watch.map(juice);
  legacyNF = !legacyNF; particles = []; refresh();
  $('[data-ljs-model]').innerHTML = `<span class="key">M</span>nofollow model: ${legacyNF ? 'pre-2009' : '2009+'}`;
  $('[data-ljs-model]').setAttribute('aria-pressed', String(legacyNF));
  log(`$ set nofollow-model=${legacyNF ? 'pre-2009   (nofollow links ignored, followed links split everything)' : '2009+   (nofollow counts in divisor, its share evaporates)'}`, 'cmd');
  log(watch.map((n, i) => `${n.label} ${before[i].toFixed(1)} → ${juice(n).toFixed(1)}`).join('   '), 'hi');
}
$('[data-ljs-model]').onclick = toggleModel;

root.addEventListener('keydown', ev => {
  const tag = (ev.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'select' || tag === 'textarea' || ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const k = ev.key.toLowerCase();
  const modes = { '1': 'move', '2': 'add', '3': 'link', '4': 'nofollow', '5': 'delete' };
  if (modes[k]) { setMode(modes[k]); ev.preventDefault(); }
  else if (k === 's') { startSweep(); ev.preventDefault(); }
  else if (k === 'r') { load(scenarioKey); ev.preventDefault(); }
  else if (k === 'm') { toggleModel(); ev.preventDefault(); }
  else if (k === ' ' && ev.target === stage) { togglePause(); ev.preventDefault(); }
  else if (k === 'escape' && linkFrom) { linkFrom = null; renderHud(); }
  else return;
  ev.stopPropagation();
});

/* ---------- sizing ---------- */
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = stage.clientWidth;
  H = W < 600 ? Math.round(clamp(W * 1.15, 420, 560)) : Math.round(clamp(W * .62, 440, 660));
  cv.style.height = H + 'px';
  RS = clamp(W / 860, .62, 1);
  const px = W < 600 ? 34 : 48;
  PAD = { l: px, r: px, t: W < 600 ? 62 : 44, b: 38 };
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
}
new ResizeObserver(resize).observe(stage);
resize();
if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; last = performance.now(); }).observe(stage);

/* ---------- boot ---------- */
const boot = [
  ['[ ok ] mounting /dev/web-graph', 'ok'],
  ['[ ok ] loading pagerank.v1998 (damping=0.85, power iteration)', 'ok'],
  ['[ ok ] nofollow handler: 2009+ (share evaporates). press M for pre-2009', 'ok'],
  ['[warn] spambrain module armed. press S to sweep', 'bad'],
  ['hover a node for details. keys: 1-5 tools, S sweep, M nofollow model, R reset, space pause', 'info']
];
boot.forEach(([m, c], i) => setTimeout(() => log(m, c), 120 * i));
setTimeout(() => load(scenarioKey), 120 * boot.length);
computePR(); renderScenarios(); setMode('move');
requestAnimationFrame(frame);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
