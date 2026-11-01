// Winvest Capital service worker: makes the site installable and usable offline.
// Pages: network first, cached copy when offline. Hashed assets and icons: cache first.
const VERSION = 'wc-v4'
const CORE = ['/', '/nl/', '/lot-size-calculator/', '/nl/lotgrootte-calculator/', '/app-icon-192.png', '/logo.jpeg']

self.addEventListener('install', (e) => {
  // Cache each core file on its own, so one failing request never blocks installation.
  e.waitUntil(caches.open(VERSION).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin) return // TradingView, Analytics etc. go straight to the network

  if (req.mode === 'navigate') {
    // Revalidate with the server (cache: 'no-cache') so an old redirect stored in the browser
    // (e.g. the former Linkme forward of the homepage) can never be reused.
    const fresh = new Request(req.url, { cache: 'no-cache', redirect: 'manual', credentials: 'same-origin' })
    e.respondWith(
      fetch(fresh)
        .then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone()
            caches.open(VERSION).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(async () => (await caches.match(req)) || (await caches.match(url.pathname.startsWith('/nl/') ? '/nl/' : '/'))),
    )
    return
  }

  if (url.pathname.startsWith('/assets/') || /\.(png|jpe?g|svg|ico|webp|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(VERSION).then((c) => c.put(req, copy))
            }
            return res
          }),
      ),
    )
  }
})
