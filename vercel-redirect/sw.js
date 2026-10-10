// Remplace l'ancien service worker de la PWA installée depuis Vercel : il se désinstalle,
// vide les caches et envoie les fenêtres ouvertes vers la nouvelle adresse
const TARGET = 'https://stats-basket-2517f.web.app'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map(k => caches.delete(k)))
    await self.registration.unregister()
    const windows = await self.clients.matchAll({ type: 'window' })
    windows.forEach(w => w.navigate(TARGET).catch(() => {}))
  })())
})
