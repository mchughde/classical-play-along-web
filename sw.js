// Keeps the app working offline after the first visit. Always tries the
// network first so a new version shows up as soon as you're online; falls
// back to the saved copy when you're not. The version below is bumped on
// every commit, which clears out old saved copies.
const CACHE = 'play-along-v7';
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-512.png'];

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's own 10-minute copy (GitHub Pages sends max-age=600),
  // so a new version is saved at once rather than the old files being stored again.
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // The app's own files: always ask GitHub whether they changed ('no-cache'), never the
  // browser's 10-minute copy, so a new version shows up the next time the app is opened.
  const fresh = url.origin === self.location.origin
    ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
    : fetch(e.request);
  e.respondWith(
    fresh
      .then(res => {
        if (!res.ok) return res;
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
