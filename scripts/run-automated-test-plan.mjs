import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const json = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const text = async (file) => readFile(path.join(root, file), 'utf8');
const results = [];
const record = (status, ids, description, detail = '') => results.push({ status, ids, description, detail });
const check = (condition, ids, description, detail = '') => record(condition ? 'PASS' : 'FAIL', ids, description, condition ? '' : detail);
const unique = (items) => new Set(items).size === items.length;

const questions = await json('content/questions.json');
const weekly = await json('content/weekly_game.json');
const rotating = await json('content/rotating_orders.json');
const metrics = await json('content/executive_metrics.json');
const jokes = await json('content/jokes.json');
const manifest = await json('public/manifest.webmanifest');
const gameSource = await text('app/game.tsx');
const serviceWorker = await text('public/service-worker.js');
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

check(questions.length === 55, ['Q-001'], 'Question bank contains the expected 55 questions.', `Found ${questions.length}.`);
check(questions.filter((q) => q.type === 'standard').length === 50, ['G-030', 'Q-001'], 'Question bank contains 50 standard questions.');
check(questions.filter((q) => q.type === 'live').length === 5, ['G-040', 'Q-001'], 'Question bank contains 5 live questions.');
check(questions.every((q) => ['standard', 'live'].includes(q.type)), ['G-030', 'G-040', 'Q-006'], 'Every published question uses a supported type.');
check(unique(questions.map((q) => q.id)), ['Q-007'], 'Published question IDs are unique.');
check(unique(questions.map((q) => q.number)), ['Q-007'], 'Published question numbers are unique.');
check(questions.every((q) => Array.isArray(q.choices) && q.choices.length === 4 && q.choices.every(Boolean)), ['G-010', 'Q-007'], 'Every question has exactly four non-empty choices.');
check(questions.every((q) => Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3), ['G-014', 'Q-007'], 'Every question has a valid correct index.');
check(questions.every((q) => Array.isArray(q.feedback) && q.feedback.length === 4 && q.feedback.every(Boolean)), ['G-011', 'G-012', 'Q-007'], 'Every question has four non-empty feedback messages.');
check(questions.every((q) => Array.isArray(q.sources) && q.sources.length > 0 && q.sources.every((s) => s.title)), ['Q-007', 'Q-010'], 'Every question has titled provenance.');
check(questions.every((q) => q.sources.every((s) => !['official', 'reference'].includes(s.kind) || /^https?:\/\//.test(s.url ?? ''))), ['Q-008'], 'Official/reference question sources use HTTP(S) URLs.');
check(questions.every((q) => q.sources.every((s) => !['internal', 'user_supplied_asset'].includes(s.kind) || Boolean(s.path))), ['Q-009'], 'Internal/asset question sources provide project paths.');

const scheduleIds = days.flatMap((day) => weekly.dailyQuestionIds?.[day] ?? []);
const enabledIds = new Set(questions.filter((q) => q.enabled !== false).map((q) => q.id));
check(days.every((day) => weekly.dailyQuestionIds?.[day]?.length === 5), ['G-033', 'W-005', 'W-008'], 'Every weekday schedules exactly five questions.');
check(scheduleIds.length === 35 && unique(scheduleIds), ['W-005', 'W-008'], 'Weekly schedule contains 35 unique question IDs.', `${scheduleIds.length} slots, ${new Set(scheduleIds).size} unique.`);
check(scheduleIds.every((id) => enabledIds.has(id)), ['W-008', 'X-002', 'X-003'], 'Every scheduled ID exists and is enabled.');
const [wy, wm, wd] = weekly.weekStart.split('-').map(Number);
check(new Date(wy, wm - 1, wd, 12).getDay() === 1, ['G-054', 'W-004'], 'Published week-start is a Monday.');
const target = weekly.target;
check(['xPct', 'yPct', 'widthPct', 'heightPct'].every((key) => Number.isFinite(target[key])), ['W-012'], 'Weekly target has numeric percentage geometry.');
check(target.xPct >= 0 && target.yPct >= 0 && target.widthPct > 0 && target.heightPct > 0 && target.xPct + target.widthPct <= 100 && target.yPct + target.heightPct <= 100, ['G-085', 'G-086', 'W-011', 'W-012'], 'Weekly target rectangle is fully inside the image.');
check(Boolean(weekly.imageAlt?.trim()), ['G-070', 'W-014'], 'Weekly image has a non-empty accessible description.');
check(Array.isArray(weekly.meltdownResponses) && weekly.meltdownResponses.length > 0 && weekly.meltdownResponses.every(Boolean), ['G-068', 'W-015'], 'Weekly meltdown responses are non-empty.');
try { await access(path.join(root, 'public', weekly.image.replace(/^\//, ''))); record('PASS', ['G-060', 'G-069', 'W-018', 'X-004'], 'Referenced weekly image exists in public assets.'); }
catch { record('FAIL', ['G-060', 'G-069', 'W-018', 'X-004'], 'Referenced weekly image exists in public assets.', weekly.image); }

check(Number.isInteger(metrics.activeInjunctions) && metrics.activeInjunctions >= 0, ['M-002', 'M-003'], 'Active injunction metric is a non-negative integer.');
check(Number.isInteger(metrics.golfCounter) && metrics.golfCounter >= 0, ['M-002', 'M-003'], 'Golf metric is a non-negative integer.');
check(Number.isInteger(metrics.simulatedPoll) && metrics.simulatedPoll >= 0 && metrics.simulatedPoll <= 100, ['M-002', 'M-003'], 'Simulated poll is an integer from 0 to 100.');
check(/^\d{4}-\d{2}-\d{2}$/.test(metrics.latestExecutiveOrder?.date ?? ''), ['M-003'], 'Executive-order date uses YYYY-MM-DD.');
check(!Number.isNaN(Date.parse(metrics.lastUpdated)), ['M-003'], 'Metrics lastUpdated is a valid timestamp.');

check(typeof rotating.enabled === 'boolean' && Array.isArray(rotating.orders) && rotating.orders.length > 0, ['R-001', 'R-008'], 'Rotating-orders file has valid top-level settings.');
check(unique(rotating.orders.map((o) => o.id)) && unique(rotating.orders.map((o) => o.number)), ['R-003'], 'Rotating-order IDs and numbers are unique.');
check(rotating.orders.some((o) => o.id === rotating.activeOrderId), ['R-006', 'R-008'], 'Active rotating-order ID exists.');
check(rotating.orders.every((o) => o.type === 'standard' && o.number >= 101 && o.choices.length >= 2 && o.feedback.length === o.choices.length && o.correctIndex >= 0 && o.correctIndex < o.choices.length), ['R-002', 'R-003'], 'Published rotating orders satisfy standard-question constraints.');

const tokens = { default: ['{question}', '{failureType}', '{bingScore}'], early: ['{question}', '{bingScore}'], late: ['{question}', '{failureType}'] };
check(Array.isArray(jokes.tickerHeadlines) && jokes.tickerHeadlines.length > 0 && jokes.tickerHeadlines.every(Boolean), ['J-002', 'J-003'], 'Jokes file has ticker headlines.');
check(Array.isArray(jokes.recoveryMessages) && jokes.recoveryMessages.length > 0 && jokes.recoveryMessages.every(Boolean), ['J-002', 'J-003'], 'Jokes file has recovery messages.');
check(Object.entries(tokens).every(([group, required]) => jokes.shareTemplates[group]?.length === 3 && jokes.shareTemplates[group].every((value) => required.every((token) => value.includes(token)))), ['J-004', 'J-005'], 'All share-template variations contain required tokens.');
check(Object.values(jokes.labels).every((value) => typeof value === 'string' && value.trim()), ['J-006'], 'All interface labels are non-empty.');

check(manifest.start_url === './' && manifest.scope === './' && manifest.display === 'standalone', ['G-140'], 'PWA manifest uses relative start/scope and standalone display.');
check(manifest.icons?.some((i) => i.sizes === '192x192') && manifest.icons?.some((i) => i.sizes === '512x512'), ['G-140'], 'PWA manifest declares 192px and 512px icons.');
for (const icon of manifest.icons ?? []) {
  try { await access(path.join(root, 'public', icon.src)); record('PASS', ['G-140'], `PWA icon exists: ${icon.src}.`); }
  catch { record('FAIL', ['G-140'], `PWA icon exists: ${icon.src}.`); }
}
check(serviceWorker.includes("'/manifest.webmanifest'") && serviceWorker.includes("'/assets/weekly/week-demo.png'") && serviceWorker.includes('fetch(event.request)'), ['G-142', 'G-143', 'G-145'], 'Service worker declares core assets and network-first fetch handling.');

const liveQuestions = questions.filter((q) => q.type === 'live');
const resolveMetric = (key) => key?.split('.').reduce((value, segment) => value && typeof value === 'object' ? value[segment] : undefined, metrics);
const runtimeImportsMetrics = /executive_metrics/.test(gameSource);
check(runtimeImportsMetrics, ['G-041', 'G-042', 'M-009', 'X-005'], 'Player runtime consumes executive metrics for live questions.', 'app/game.tsx does not import or read executive_metrics.json.');
const runtimeImportsJokes = /jokes\.json/.test(gameSource);
check(runtimeImportsJokes, ['G-130', 'J-011', 'X-006'], 'Player runtime consumes jokes/share-template data.', 'app/game.tsx hardcodes share/ticker wording and does not import jokes.json.');
const runtimeImportsRotating = /rotating_orders/.test(gameSource);
check(runtimeImportsRotating, ['R-013', 'X-007'], 'Player runtime consumes rotating-order data.', 'app/game.tsx does not import rotating_orders.json.');
const revealStart = gameSource.indexOf("if (phase === 'reveal')");
const rotatingCard = gameSource.indexOf('className="rotating-order-card"');
const homeStart = gameSource.indexOf('className="daily-shell home-view"');
check(revealStart >= 0 && rotatingCard > revealStart && rotatingCard < homeStart, ['G-001', 'R-013', 'X-007'], 'Rotating bonus appears after the daily quiz, not on the intro screen.');
check(liveQuestions.every((q) => typeof q.metricKey === 'string' && q.metricKey.length > 0), ['G-041', 'Q-005'], 'Every live question declares a metric key.', liveQuestions.filter((q) => !q.metricKey).map((q) => q.id).join(', '));
check(liveQuestions.every((q) => Number.isFinite(resolveMetric(q.metricKey))), ['G-041', 'G-043', 'M-009', 'X-005'], 'Every live-question metric key resolves to a finite published value.', liveQuestions.filter((q) => !Number.isFinite(resolveMetric(q.metricKey))).map((q) => `${q.id}:${q.metricKey}`).join(', '));

const base = process.env.TEST_BASE_URL ?? 'https://satiricalgames.github.io/TrumpsImpossibleGame';
const routes = [
  ['/', 'IMPOSSIBLE'],
  ['/admin/', 'ADMIN HQ'],
  ['/question-editor/', 'QUESTION BANK MANAGER'],
  ['/weekly-editor/', 'WEEKLY GAME SCHEDULER'],
  ['/rotating-orders-editor/', 'ROTATING ORDERS EDITOR'],
  ['/executive-metrics-editor/', 'EXECUTIVE METRICS EDITOR'],
  ['/jokes-editor/', 'JOKES JSON EDITOR'],
];
for (const [route, marker] of routes) {
  try {
    const response = await fetch(`${base}${route}?test=${Date.now()}`);
    const body = await response.text();
    check(response.ok && (route === '/' || body.includes(marker)), route === '/' ? ['G-001', 'G-002', 'G-157'] : ['A-001', 'A-002', 'D-003', 'G-157'], `Live route returns expected content: ${route}.`, `HTTP ${response.status}; marker ${marker}.`);
    if (route !== '/') check(/name="robots" content="[^"]*noindex/i.test(body), ['A-004', 'D-003'], `Private route emits noindex metadata: ${route}.`);
  } catch (error) {
    record('BLOCKED', route === '/' ? ['G-001', 'G-002', 'G-157'] : ['A-001', 'A-002', 'D-003', 'G-157'], `Live route check: ${route}.`, error.message);
  }
}
try {
  const response = await fetch(`${base}/robots.txt?test=${Date.now()}`);
  const body = await response.text();
  check(response.ok && ['/admin/', '/question-editor/', '/weekly-editor/', '/rotating-orders-editor/', '/executive-metrics-editor/', '/jokes-editor/'].every((route) => body.includes(`Disallow: /TrumpsImpossibleGame${route}`)), ['A-005', 'D-004'], 'Live robots.txt disallows every private-tool route.');
} catch (error) { record('BLOCKED', ['A-005', 'D-004'], 'Live robots.txt check.', error.message); }

const counts = results.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] ?? 0) + 1 }), {});
const assertedIds = new Set(results.flatMap((item) => item.ids));
for (const item of results) console.log(`${item.status}\t${item.ids.join(',')}\t${item.description}${item.detail ? `\t${item.detail}` : ''}`);
console.log(`SUMMARY\t${JSON.stringify(counts)}\t${results.length} automated assertions; ${assertedIds.size} unique plan IDs referenced`);
if (results.some((item) => item.status === 'FAIL')) process.exitCode = 1;
