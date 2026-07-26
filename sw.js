/* ============================================================
   Service worker — permet à l'application de fonctionner
   hors connexion et d'être installable.
   IMPORTANT : après une modification du code, change VERSION
   ci-dessous pour forcer la mise à jour chez les utilisateurs.
   ============================================================ */

const VERSION = 'faala-geun-v11';

/** Fichiers de l'application mis en cache dès l'installation. */
const COQUILLE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './data/contenu.js',
  './assets/css/style.css',
  './assets/js/app.js',
  // Volontairement absent : admin.html et ses fichiers.
  // C'est un outil local, il n'est pas publié en ligne — le déclarer ici
  // ferait échouer toute l'installation du cache là où il n'existe pas.
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/img/couverture-1.svg',
  './assets/img/couverture-2.svg',
  './assets/img/couverture-3.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(COQUILLE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(c => c !== VERSION).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // laisse passer YouTube, etc.

  // L'espace de gestion et son serveur ne passent JAMAIS par le cache :
  // sinon une ancienne version de l'interface reste bloquée en mémoire
  // et l'enregistrement direct cesse de fonctionner.
  if (url.pathname.includes('admin') || url.pathname.startsWith('/api/')) return;

  // Les gros médias : jamais mis en cache (requêtes partielles / place disque).
  if (url.pathname.includes('/medias/')) return;

  // Le contenu : réseau d'abord, pour voir les ajouts tout de suite.
  if (url.pathname.endsWith('contenu.js')) {
    e.respondWith(
      fetch(req)
        .then(rep => {
          const copie = rep.clone();
          caches.open(VERSION).then(c => c.put(req, copie));
          return rep;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Le reste : cache d'abord, réseau en secours.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(rep => {
      if (rep.ok && rep.type === 'basic') {
        const copie = rep.clone();
        caches.open(VERSION).then(c => c.put(req, copie));
      }
      return rep;
    }).catch(() => caches.match('./index.html')))
  );
});
