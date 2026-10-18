/* Black Hat Oracle: local Simulated environment. No fetch, API, domain storage or live assessment. */
(function () {
  'use strict';
  // Filled by build.cjs from the hand-drawn ASCII illustrations.
  const ASCII = {"logo":"          .--------.\n       .-'          '-.\n      /     .----.     \\\n     /     /      \\     \\\n    |     |  .  .  |     |\n    |     |  ____  |     |\n     \\     \\ '--' /     /\n      '._   '----'   _.'\n   .----/'----------'\\----.\n  /    /              \\    \\\n /____/________________\\____\\\n|  .----------------------.  |\n|  |  >_              []  |  |\n|  |  [=====>           ] |  |\n|  '----------------------'  |\n'----------.----.------------'\n        ___|____|___\n       '------------'","report":".--------------------------------.\n| .----------------------------. |\n| |  .--.          .--.        | |\n| | (    )---+----(    )       | |\n| |  '--'    |     '--'        | |\n| |       .--'--.              | |\n| |       |  >_ |  [||||||||]  | |\n| |       '-----'              | |\n| '----------------------------' |\n|   o                      [==]  |\n'---------------.----------------'\n            ____|____\n       .---'_________'---.\n      / [] [] [] [] [] [] \\\n     / [] [] [] [] [] [] []\\\n     '----------------------'","pbn":"     .---------.       .---------.\n     | [=] [=] |       | [=] [=] |\n     |  o   o  |       |  o   o  |\n     '----+----'       '----+----'\n          |                 |\n          +--------+--------+\n                   |\n.---------.   .----+----.   .---------.\n| [=] [=] +---+ [/////] +---+ [=] [=] |\n|  o   o  |   |  >_     |   |  o   o  |\n'---------'   '----+----'   '---------'\n                   |\n              .----v----.\n              |  /\\ /\\  |\n              |  \\/ \\/  |\n              '---------'","expired":".------------.           .------------.\n| .--------. |           | .--------. |\n| |  ....  | |           | |  >_    | |\n| |  ....  | |           | |  ====  | |\n| '--------' |           | '--------' |\n'------------'           '------------'\n       \\                       /\n        \\     _________       /\n         '---|\\       /|-----'\n             | \\ . . / |\n             |  \\ . /  |\n             |   \\ /   |\n             |   / \\   |\n             |  / . \\  |\n             | /.....\\ |\n             |/_______\\|","parasite":"      .----------------.\n      | []  []  []  [] |\n      | []  []  []  [] |\n      | []  []  []  [] |\n      | []  []  []  [] |    .-------.\n      | []  []  []  [] |====| .---. |\n      | []  []  []  [] |    | | > | |\n      | []  []  []  [] |    | '---' |\n      | []  []  []  [] |    '---+---'\n      | []  []  []  [] |        |\n _____|______.._______|________|_____\n / / / / / / || / / / / / / / / / /\n------------------------------------","scaled":" .--------.\n | ====== |                  .--------.\n | ====== |                 / ====== /|\n | ====== |                / ====== / |\n '----+---'               /________/  |\n      |                   | ====== | /|\n.-----v------------.      | ====== |/ |\n|  .------------.  |      | ====== | /|\n|  | [::::::::] |  +----->| ====== |/ |\n|  '------------'  |      | ====== | /|\n|  o  o    [|||]   |      | ====== |/ |\n'------------------'      | ====== | /\n                          '--------'","ctr":".---------------------------.\n|  o  o  o                  |\n|---------------------------|\n|   _____________           |\n|  |_____________|          |\n|                           |\n|   ================        |\n|   -----------      .      |\n|                   /|  \\|/ |\n|   ============   / | --*--|\n|   -----------   /  |  /|\\ |\n|                /___|      |\n|                   \\ \\     |\n'--------------------\\_\\----'","cloaking":"            .------.\n          .'  .--.  '.\n         /   /    \\   \\\n        |   | o  o |   |\n        |   |  --  |   |\n         \\   \\____/   /\n          '._      _.'\n             /----\\\n     .------+      +------.\n     |                    |\n.----v----.          .----v----.\n|  [=][=] |          |  .---.  |\n|  .____. |          | ( o o ) |\n|  |____| |          |  \\_-_/  |\n'---------'          '---------'","doorway":"  .-----.     .-----.     .-----.\n /       \\   /       \\   /       \\\n|  .---.  | |  .---.  | |  .---.  |\n|  |   |  | |  |   |  | |  |   |  |\n|  |  o|  | |  |  o|  | |  |  o|  |\n|__|___|__| |__|___|__| |__|___|__|\n     |           |           |\n     '-----------+-----------'\n                 |\n                 v\n            .---------.\n            | .-----. |\n            | | >_  | |\n            | '-----' |\n            '---------'","geo":"(o)------(o)------(o)\n |\\     / | \\     /|\n | \\   /  |  \\   / |\n |  (o)---+---(o)  |\n | /   \\  |  /   \\ |\n |/     \\ | /     \\|\n(o)------(o)------(o)\n          |\n          v\n .-----------------.\n |  \" .......... \" |\n |  \" .......    \" |\n |       [1] [2]   |\n '-------.  .------'\n          \\/"};
  const catalog = [
    { id: 'pbn', title: 'Private blog network authority', vector: 'LINK EQUITY', risk: 'HIGH', file: 'private-blog-networks.html',
      recommendation: 'Prioritize a controlled link-network scenario to concentrate authority around high-intent landing pages.',
      mechanism: 'The playbook attempts to influence link signals through sites controlled by the same operator. Apparent authority and lasting ranking gains are different questions.',
      tradeoff: 'Network footprints, discounted links, and manual-action exposure.',
      label: 'Open the PBN dossier' },
    { id: 'expired', title: 'Expired-domain authority reuse', vector: 'DOMAIN HISTORY', risk: 'HIGH', file: 'expired-domain-abuse.html',
      recommendation: 'Move historical-domain authority to the front of the simulated acquisition shortlist.',
      mechanism: 'The premise is that a domain’s old links and reputation could benefit repurposed content. The archive examines why history alone does not establish transferable ranking value.',
      tradeoff: 'Irrelevant history, broken user expectations, and expired-domain abuse enforcement.',
      label: 'Open the expired-domain dossier' },
    { id: 'parasite', title: 'Site reputation leverage', vector: 'HOST AUTHORITY', risk: 'HIGH', file: 'parasite-seo.html',
      recommendation: 'Prioritize established-host visibility as the scenario’s accelerated route into competitive results.',
      mechanism: 'This strategy places third-party content on an established host in an attempt to benefit from the host’s ranking signals. Editorial control, purpose, and policy context matter.',
      tradeoff: 'Host dependency, content removal, and site reputation abuse enforcement.',
      label: 'Open the parasite SEO dossier' },
    { id: 'scaled', title: 'Scaled long-tail content coverage', vector: 'QUERY COVERAGE', risk: 'HIGH', file: 'scaled-content-abuse.html',
      recommendation: 'Weight broad long-tail coverage as a primary expansion route in this simulated strategy mix.',
      mechanism: 'The playbook attempts to capture many queries through large numbers of pages. Scale or AI use alone is not the issue; the archive focuses on purpose, originality, and user value.',
      tradeoff: 'Thin value, duplication, indexation uncertainty, and scaled-content abuse.',
      label: 'Open the scaled-content dossier' },
    { id: 'ctr', title: 'CTR & engagement manipulation', vector: 'BEHAVIOR SIGNALS', risk: 'HIGH', file: 'ctr-navboost.html',
      recommendation: 'Promote click-signal manipulation to the behavioral branch of the simulated shortlist.',
      mechanism: 'The premise is that manufactured engagement can influence rankings. Public evidence that clicks are used does not demonstrate that purchased clicks deliver a reliable uplift.',
      tradeoff: 'Unproven returns, invalid traffic, and misleading attribution.',
      label: 'Open the CTR / NavBoost dossier' },
    { id: 'cloaking', title: 'Crawler / visitor content divergence', vector: 'CONTENT DELIVERY', risk: 'EXTREME', file: 'search-manipulation.html', fragment: 'sm-cloaking',
      recommendation: 'Assign cloaking to the high-risk content-delivery branch of this scenario.',
      mechanism: 'The playbook shows materially different content to search engines and visitors to influence search visibility. The dossier explains the mechanism, detection, and policy boundaries.',
      tradeoff: 'Crawler / user inconsistencies, manual actions, and loss of search visibility.',
      label: 'Open the cloaking section' },
    { id: 'doorway', title: 'Doorway-page query expansion', vector: 'LANDING PAGES', risk: 'HIGH', file: 'search-manipulation.html', fragment: 'sm-doorway',
      recommendation: 'Shortlist query-specific landing-page expansion as a simulated coverage opportunity.',
      mechanism: 'Doorway strategies create similar pages for related searches that funnel visitors to essentially the same destination. Useful, distinct landing pages are a different case.',
      tradeoff: 'Near-duplicate pages, poor user value, and doorway-abuse enforcement.',
      label: 'Open the doorway-page section' },
    { id: 'geo', title: 'AI search & citation influence', vector: 'ANSWER VISIBILITY', risk: 'HIGH', file: 'ai-geo.html',
      recommendation: 'Add citation influence to the scenario’s emerging-channel strategy mix.',
      mechanism: 'This playbook attempts to influence which sources AI search systems retrieve and cite. The archive separates product-specific observations from unsupported visibility promises.',
      tradeoff: 'Unstable retrieval, weak attribution, and uncertain effects across products.',
      label: 'Open the AI search / GEO dossier' }
  ];
  const phases = ['Initializing environment', 'Modeling scenario signals', 'Correlating strategy modules', 'Compiling strategy report'];
  const steps = [
    [0, 'Reading scenario manifest', '8 modules loaded', 500],
    [0, 'Preparing isolated analysis session', 'ready', 500],
    [0, 'Unpacking authority-graph module', 'complete', 600],
    [0, 'Unpacking content-footprint module', 'complete', 420],
    [1, 'Building simulated referring-domain topology', 'modeled', 950],
    [1, 'Evaluating anchor concentration patterns', 'modeled', 850],
    [1, 'Projecting historical-domain pathways', 'modeled', 1100],
    [1, 'Mapping query coverage and page intent', 'modeled', 1050],
    [1, 'Profiling crawler / visitor content variance', 'modeled', 850],
    [2, 'Correlating host authority and content scale', 'matched', 950],
    [2, 'Evaluating behavioral-signal scenarios', 'matched', 1100],
    [2, 'Comparing AI-search citation pathways', 'matched', 800],
    [2, 'Resolving strategy dependencies', 'resolved', 950],
    [3, 'Ranking 8 candidate playbooks', '3 shortlisted', 1000],
    [3, 'Attaching archive dossiers', 'linked', 500],
    [3, 'Writing simulated strategy report', 'complete', 500]
  ];
  const diagnostics = [
    ['Reading package lists... Done', 'Dependency tree: 8 installed / 0 missing'],
    ['mount /archive --read-only', 'sandbox: local simulation / network: disabled'],
    ['Selecting previously unselected package authority-graph.', 'Unpacking authority-graph (1.0.0)...'],
    ['Unpacking content-footprint (1.0.0)...', 'Setting up oracle-analysis.target...'],
    ['graph.load: synthetic vertices initialized', 'graph.walk: authority paths traversed'],
    ['anchor-distribution: scenario weights loaded', 'link-entropy: comparison pass complete'],
    ['domain-history: scenario branches expanded', 'authority-transfer: hypothesis registered'],
    ['query-map: long-tail clusters assembled', 'page-intent: coverage matrix populated'],
    ['render.compare: crawler / visitor model', 'content-delta: divergence module ready'],
    ['host-authority: strategy associations loaded', 'content-scale: dependencies resolved'],
    ['engagement-model: click-signal hypothesis loaded', 'behavior-profile: correlation pass complete'],
    ['retrieval-model: source candidates indexed', 'citation-paths: scenario map assembled'],
    ['Running post-install strategy hooks...', '8 modules available / 3 selected for report'],
    ['Sorting candidate playbooks by scenario weight...', 'Priority queue: [01] [02] [03]'],
    ['Resolving local archive references...', '3 dossiers linked / broken references: 0'],
    ['Writing strategy-report.txt...', 'oracle-analysis.target: reached']
  ];
  const diagrams = {
    1: '  [ DOMAIN ]\n       |\n       +-- authority.graph\n       +-- content.surface\n       `-- behavior.model',
    2: '  [ SIGNALS ] --> [ STRATEGY ENGINE ]\n                          |\n                   [ 8 PLAYBOOKS ]\n                          |\n                   [ 3 PRIORITIES ]'
  };

  function init() {
    const root = document.querySelector('[data-oracle]');
    if (!root) return;
    const $ = s => root.querySelector(s);
    const form = $('.oracle-form'), input = $('input[name="domain"]'), submit = $('button[type="submit"]');
    const error = $('.oracle-error'), scan = $('.oracle-scan'), report = $('.oracle-report');
    const log = $('.oracle-log'), progress = $('.oracle-progress'), bar = $('[data-oracle-bar]');
    const announcement = $('[data-oracle-announcement]');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const BHT = window.BHT || {};
    let timer = 0, frame = 0, active = false, session = null, position = 0, transcript = [];

    const linkFor = item => {
      if (!BHT.inline) return (BHT.base || './') + item.file + (item.fragment ? '#' + item.fragment : '');
      const page = (BHT.pages || []).find(p => p.originalFile === item.file);
      return page ? page.file + (item.fragment ? '--' + item.fragment : '') : '#';
    };
    const make = (tag, className, text) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text !== undefined) el.textContent = text;
      return el;
    };
    const hash = str => {
      let n = 2166136261;
      for (let i = 0; i < str.length; i++) n = Math.imul(n ^ str.charCodeAt(i), 16777619);
      return n >>> 0;
    };
    function normalize(raw) {
      const value = raw.trim();
      if (!value || /[\s\\<>]/.test(value)) throw new Error('Enter a domain such as example.com, or paste a full website URL.');
      let url;
      try { url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : 'https://' + value); }
      catch (_) { throw new Error('That domain could not be read. Try example.com.'); }
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) throw new Error('Use a website domain or an HTTP(S) URL without a login or port number.');
      const host = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
      const labels = host.split('.');
      if (host.length > 253 || labels.length < 2 || !/[a-z]/i.test(labels[labels.length - 1]) || labels[labels.length - 1].length < 2 || labels.some(s => !/^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(s))) {
        throw new Error('Enter a complete domain such as example.com. IP addresses and local hostnames are not supported.');
      }
      return host;
    }
    function clearTimers() { clearTimeout(timer); cancelAnimationFrame(frame); }
    function setProgress(p) {
      const whole = Math.min(100, Math.floor(p));
      progress.setAttribute('aria-valuenow', String(whole));
      const count = Math.floor(whole * 24 / 100);
      bar.textContent = '[' + '█'.repeat(count) + '░'.repeat(24 - count) + ']';
      $('[data-oracle-percent]').textContent = String(whole).padStart(3, ' ') + '%';
    }
    function followLog() { log.scrollTop = log.scrollHeight; }
    function printRaw(text, className) {
      const row = make('div', 'oracle-raw ' + (className || ''), text);
      log.append(row); followLog(); return row;
    }
    function artBlock(key) {
      const wrap = make('div', 'oracle-ascii-wrap');
      const pre = make('pre', 'oracle-ascii', ASCII[key] || key.toUpperCase());
      pre.setAttribute('aria-hidden', 'true'); wrap.append(pre); return wrap;
    }
    function appendLine(message, detail, kind, elapsed) {
      const row = make('div', 'oracle-log-line ' + (kind || ''));
      const stamp = '[' + Math.floor(elapsed / 60).toString().padStart(2, '0') + ':' + Math.floor(elapsed % 60).toString().padStart(2, '0') + ']';
      const status = make('span', 'oracle-log-status', kind === 'running' ? '[ .. ]' : '[ OK ]');
      const body = make('span', 'oracle-log-message', message + ' ');
      const tail = make('span', 'oracle-log-state', '... ' + detail); body.append(tail);
      row.append(status, make('span', 'oracle-log-time', stamp), body);
      log.append(row); followLog();
      return { row, detail: tail, status, text: stamp + ' [ OK ] ' + message + ' ... ' + detail };
    }
    function setPhase(index) {
      $('[data-oracle-phase]').textContent = phases[index];
    }
    function bootSequence() {
      printRaw('ORACLE-BIOS 1.0  /  BHT ' + (BHT.version || '') + '  /  tty1', 'oracle-boot-heading');
      const logo = artBlock('logo'), pre = logo.querySelector('pre'), lines = pre.textContent.split('\n');
      pre.textContent = ''; log.append(logo);
      let line = 0;
      const bios = [
        'Copyright (c) Optimization Theory / Simulated environment',
        'kernel: oracle-analysis 1.0.0 / arch: browser-local',
        'cpu: strategy-engine x8    mem: 640K scenario blocks',
        '',
        '[ OK ] POST ................................ passed',
        '[ OK ] mount /archive (ro) .................. mounted',
        '[ OK ] load strategy.index ................. 8 entries',
        '[ OK ] verify environment.notice ............ present',
        '[ OK ] network.interface ................... disabled',
        ''
      ];
      function bootTick() {
        if (!active) return;
        if (line < lines.length) { pre.textContent += (line ? '\n' : '') + lines[line++]; followLog(); timer = setTimeout(bootTick, 55); return; }
        const idx = line++ - lines.length;
        if (idx < bios.length) { printRaw(bios[idx], bios[idx].startsWith('[ OK ]') ? 'oracle-boot-ok' : ''); timer = setTimeout(bootTick, 65); return; }
        const command = 'root@oracle:~# ./analyze --domain ' + session.domain + ' --simulate';
        const prompt = printRaw('', 'oracle-shell-prompt'); let char = 0;
        function typeCommand() {
          if (!active) return;
          char = Math.min(command.length, char + 3); prompt.textContent = command.slice(0, char) + (char < command.length ? '█' : ''); followLog();
          if (char < command.length) timer = setTimeout(typeCommand, 18); else timer = setTimeout(nextStep, 240);
        }
        typeCommand();
      }
      bootTick();
    }
    function pickSession(domain) {
      const seed = hash(domain);
      // Seed only personalizes the fictional scenario. It does not assess the website.
      const ranked = catalog.map(item => ({ ...item, order: hash(domain + '/' + item.id) })).sort((a,b) => b.order - a.order).slice(0, 3);
      return { domain, id: seed.toString(16).toUpperCase().padStart(8, '0'), date: new Date(), ranked,
        profile: ['AUTHORITY-LED', 'CONTENT-LED', 'SIGNAL-LED'][seed % 3], start: performance.now() };
    }
    function renderReport() {
      const results = $('.oracle-results'); results.replaceChildren();
      session.ranked.forEach((item, i) => {
        const card = make('article', 'oracle-strategy'); card.dataset.strategy = item.id;
        card.style.setProperty('--print-order', i);
        card.append(make('div', 'oracle-file-prompt', 'root@oracle:~# cat ./dossiers/' + item.id + '.txt'));
        const top = make('div', 'oracle-strategy-top');
        top.append(make('span', 'oracle-priority', '┌─ PRIORITY ' + String(i + 1).padStart(2, '0')), make('span', 'oracle-vector', '/ ' + item.vector), make('span', 'oracle-risk', '[' + item.risk + ' RISK]'));
        const title = make('h3', '', item.title);
        card.append(top, artBlock(item.id), title, make('div', 'oracle-field-label', 'recommendation:'), make('p', 'oracle-recommendation', item.recommendation));
        const mechanism = make('p', 'oracle-mechanism', item.mechanism);
        const tradeoff = make('p', 'oracle-tradeoff', item.tradeoff);
        const link = make('a', 'oracle-dossier', '└─ [ ' + item.label + ' ↗ ]'); link.href = linkFor(item);
        card.append(make('div', 'oracle-field-label', 'mechanism:'), mechanism, make('div', 'oracle-field-label oracle-exposure-label', 'exposure:'), tradeoff, link); results.append(card);
      });
      $('[data-oracle-report-art]').textContent = ASCII.report || 'REPORT';
      $('[data-oracle-tree]').textContent = '/reports/' + session.id.toLowerCase() + '/\n' + session.ranked.map((item, i) => (i === session.ranked.length - 1 ? '└── ' : '├── ') + String(i + 1).padStart(2, '0') + '_' + item.id + '.txt').join('\n') + '\n\n3 dossiers / 8 strategy modules';
      $('[data-oracle-report-title]').textContent = session.domain;
      $('[data-oracle-profile]').textContent = session.profile;
      $('[data-oracle-report-id]').textContent = 'CASE / ' + session.id;
      $('[data-oracle-report-date]').textContent = session.date.toISOString().slice(0, 10) + ' UTC';
    }
    function finish() {
      if (!active) return;
      clearTimers(); active = false; setProgress(100);
      // Reduced-motion runs export the same completed transcript.
      transcript = ['ORACLE-BIOS 1.0 / Simulated environment', ASCII.logo || 'ORACLE', '', 'Target: ' + session.domain, 'Network: disabled / no website analysis performed', ''];
      steps.forEach((step, index) => {
        if (index === 0 || step[0] !== steps[index - 1][0]) { transcript.push('\n:: ' + phases[step[0]].toUpperCase()); if (diagrams[step[0]]) transcript.push(diagrams[step[0]]); }
        transcript.push('[ OK ] ' + step[1] + ' ... ' + step[2], ...diagnostics[index]);
      });
      transcript.push('', '[ OK ] REPORT COMPILED. 3 dossiers ready.');
      renderReport(); scan.hidden = true; report.hidden = false; root.dataset.state = 'complete';
      $('.oracle-transcript').hidden = true; $('[data-oracle-transcript]').setAttribute('aria-expanded', 'false');
      $('[data-oracle-transcript]').textContent = '[ Show scan transcript ]';
      announcement.textContent = 'Analysis complete for ' + session.domain + '. Three strategy dossiers are ready. Simulated environment.';
      $('[data-oracle-report-title]').focus({ preventScroll: true });
      report.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
    }
    function nextStep() {
      if (!active) return;
      if (position >= steps.length) { printRaw('\n[ OK ] REPORT COMPILED. 3 DOSSIERS READY.\n', 'oracle-boot-grant'); timer = setTimeout(finish, 600); return; }
      const [phase, message, detail, duration] = steps[position];
      setPhase(phase);
      if (position === 0 || phase !== steps[position - 1][0]) {
        announcement.textContent = phases[phase] + '. Simulated environment.';
        printRaw('\n:: ' + phases[phase].toUpperCase() + '\n', 'oracle-phase-title');
        if (diagrams[phase]) printRaw(diagrams[phase] + '\n', 'oracle-diagram');
      }
      const row = appendLine(message, 'running', 'running', (performance.now() - session.start) / 1000);
      const started = performance.now(), from = position / steps.length * 100, to = (position + 1) / steps.length * 100;
      let diagnostic = 0;
      const animate = now => {
        if (!active) return;
        const fraction = (now - started) / duration;
        setProgress(from + (to - from) * Math.min(.95, fraction));
        row.status.textContent = '[ ' + '|/-\\'[Math.floor((now - started) / 95) % 4] + '  ]';
        if (diagnostic < diagnostics[position].length && fraction > .2 + diagnostic * .35) printRaw('  ' + diagnostics[position][diagnostic++], 'oracle-diagnostic');
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      timer = setTimeout(() => {
        if (!active) return;
        cancelAnimationFrame(frame); row.row.className = 'oracle-log-line complete'; row.detail.textContent = '... ' + detail; row.status.textContent = '[ OK ]';
        while (diagnostic < diagnostics[position].length) printRaw('  ' + diagnostics[position][diagnostic++], 'oracle-diagnostic');
        position++; setProgress(position / steps.length * 100); nextStep();
      }, duration);
    }
    function reset(message) {
      clearTimers(); active = false; session = null; root.dataset.state = 'idle';
      scan.hidden = true; report.hidden = true; form.hidden = false; $('.oracle-intro').hidden = false;
      submit.disabled = false; input.disabled = false; error.hidden = true; input.removeAttribute('aria-invalid');
      announcement.textContent = message || 'Ready for another domain.';
      input.focus({ preventScroll: true }); input.select(); form.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
    form.addEventListener('submit', event => {
      event.preventDefault(); if (active) return;
      let domain;
      try { domain = normalize(input.value); }
      catch (err) { error.textContent = err.message; error.hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
      input.value = domain; input.removeAttribute('aria-invalid'); error.hidden = true;
      session = pickSession(domain); position = 0; active = true; root.dataset.state = 'running';
      submit.disabled = true; input.disabled = true; form.hidden = true; $('.oracle-intro').hidden = true;
      report.hidden = true; scan.hidden = false; log.replaceChildren(); setProgress(0);
      $('[data-oracle-session]').textContent = session.id; $('[data-oracle-target]').textContent = domain;
      if (motion.matches) finish();
      else { log.focus({ preventScroll: true }); scan.scrollIntoView({ block: 'start', behavior: 'smooth' }); bootSequence(); }
    });
    input.addEventListener('input', () => { error.hidden = true; input.removeAttribute('aria-invalid'); });
    $('.oracle-example').addEventListener('click', () => { input.value = 'example.com'; error.hidden = true; input.removeAttribute('aria-invalid'); input.focus(); });
    $('[data-oracle-cancel]').addEventListener('click', () => reset('Simulation canceled. Edit the domain to start again.'));
    $('[data-oracle-reset]').addEventListener('click', () => reset());
    $('[data-oracle-transcript]').addEventListener('click', () => {
      const box = $('.oracle-transcript'), button = $('[data-oracle-transcript]');
      box.hidden = !box.hidden; button.setAttribute('aria-expanded', String(!box.hidden));
      button.textContent = box.hidden ? '[ Show scan transcript ]' : '[ Hide scan transcript ]';
      if (!box.hidden) { const pre = make('pre', '', 'Simulated environment / ' + session.domain + '\n\n' + transcript.join('\n')); box.replaceChildren(pre); }
    });
    $('[data-oracle-download]').addEventListener('click', () => {
      if (!session) return;
      const lines = [ASCII.report || 'REPORT', '', 'BLACK HAT ORACLE / Simulated environment', 'No real domain analysis was performed. All priorities are fictional.', '', 'Domain: ' + session.domain, 'Case: ' + session.id, 'Generated: ' + session.date.toISOString(), 'Scenario: ' + session.profile, ''];
      session.ranked.forEach((item, i) => lines.push(ASCII[item.id] || item.title, '', 'PRIORITY ' + (i + 1) + ' / ' + item.title, item.recommendation, item.mechanism, 'Risk: ' + item.risk + '. ' + item.tradeoff, 'Dossier: https://optimizationtheory.com/blackhat-terminal/' + item.file + (item.fragment ? '#' + item.fragment : ''), ''));
      lines.push('SIMULATED SCAN TRANSCRIPT', ...transcript);
      const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
      const a = make('a'); a.href = url; a.download = 'black-hat-oracle-' + session.domain + '.txt'; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      announcement.textContent = 'Simulation report downloaded.';
    });
    motion.addEventListener('change', () => { if (motion.matches && active) finish(); });
    window.addEventListener('pagehide', () => { if (active) reset('Simulation stopped. Ready to start again.'); });
    submit.disabled = false; $('.oracle-example').disabled = false; root.dataset.state = 'idle';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
