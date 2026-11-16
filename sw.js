// Service worker mínimo: torna o app instalável e o abre sem internet.
// Incrementar CACHE a cada release.
const CACHE = 'en2-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/data.js',
  './js/state.js',
  './js/report.js',
  './js/report-html.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Estratégia:
// - Página (navegação): rede primeiro, com limite de NET_TIMEOUT; sinal fraco/sem
//   internet -> cache.
// - Demais arquivos: cache na hora (stale-while-revalidate), atualizando em segundo
//   plano. Uma release nova (CACHE incrementado) baixa tudo de novo no install.
const NET_TIMEOUT = 3000;

const fromCache = req => caches.match(req, { ignoreSearch: true });

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  const network = fetch(req, { cache: 'no-cache' }).then(res => {
    if (res.ok) {
      const copy = res.clone();
      event.waitUntil(caches.open(CACHE).then(c => c.put(req, copy)));
    }
    return res;
  });
  network.catch(() => {}); // evita "unhandled rejection" quando o cache responde antes

  if (req.mode === 'navigate') {
    const fallback = () => fromCache(req).then(r => r || caches.match('./index.html'));
    const timeout = new Promise(resolve => setTimeout(resolve, NET_TIMEOUT)).then(fallback);
    event.respondWith(Promise.race([network, timeout]).then(res => res || network).catch(fallback));
    return;
  }

  event.respondWith(fromCache(req).then(cached => cached || network));
});
