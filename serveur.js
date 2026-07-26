/* ============================================================
   Petit serveur local de FAALA GEUN.

   Il fait deux choses :
     1. il affiche l'application et l'espace de gestion ;
     2. il ENREGISTRE ce que tu saisis dans l'espace de gestion
        (le contenu et les fichiers vidéo/audio).

   Il n'écoute que sur cet ordinateur (127.0.0.1) : personne
   d'autre sur le réseau ne peut écrire dans tes fichiers.

   Lancement : double-clic sur GESTION.bat
   ============================================================ */

'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const RACINE = __dirname;
const PORT = Number(process.env.PORT) || 8080;

/* Mode réseau : accessible depuis le téléphone, sur le même Wi-Fi.
   Activé par GESTION-TELEPHONE.bat. Protégé par un code à 6 chiffres,
   car sinon n'importe qui sur le réseau pourrait modifier et publier. */
const MODE_RESEAU = process.argv.includes('--reseau');
const CODE = MODE_RESEAU ? String(Math.floor(100000 + Math.random() * 900000)) : null;
const ADRESSE = MODE_RESEAU ? '0.0.0.0' : '127.0.0.1';

/** Adresse IPv4 de cet ordinateur sur le réseau local. */
function ipLocale() {
  for (const cartes of Object.values(os.networkInterfaces())) {
    for (const c of cartes || []) {
      if (c.family === 'IPv4' && !c.internal) return c.address;
    }
  }
  return 'localhost';
}

/** Nom du site Netlify vers lequel publier. */
const SITE_NETLIFY = 'faala-geun';

/* Dossier temporaire contenant la version « propre » envoyée en ligne.
   Il est placé HORS du dossier de l'application : Node refuse de copier
   un dossier dans l'un de ses propres sous-dossiers. */
const DOSSIER_PUBLICATION = path.join(os.tmpdir(), 'faala-geun-publication');

/** Fichiers et dossiers qui restent sur cet ordinateur (outils de gestion). */
const EXCLUS_DE_LA_PUBLICATION = [
  '.publication', '.claude', 'node_modules', '.git',
  'admin.html', 'reparer.html', 'serveur.js',
  'assets/css/admin.css', 'assets/js/admin.js',
  'data/contenu.js.precedent', 'GUIDE.md'
];

/** Seuls ces dossiers peuvent recevoir des fichiers média. */
const DOSSIERS_AUTORISES = new Set(['medias/videos', 'medias/audios', 'medias/images']);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

/* ------------------------------------------------------------
   Sécurité : rien ne doit sortir du dossier de l'application
   ------------------------------------------------------------ */

function cheminSur(relatif) {
  const complet = path.resolve(RACINE, '.' + path.sep + relatif);
  const base = path.resolve(RACINE) + path.sep;
  return (complet + path.sep).startsWith(base) ? complet : null;
}

/** Un nom de fichier simple, sans dossier ni piège. */
function nomSur(nom) {
  const propre = path.basename(String(nom || '')).replace(/[^a-zA-Z0-9._-]/g, '-');
  return (!propre || propre.startsWith('.')) ? null : propre;
}

function lireCorps(req, limiteOctets) {
  return new Promise((ok, ko) => {
    const morceaux = [];
    let total = 0;
    req.on('data', m => {
      total += m.length;
      if (total > limiteOctets) { ko(new Error('Fichier trop volumineux')); req.destroy(); return; }
      morceaux.push(m);
    });
    req.on('end', () => ok(Buffer.concat(morceaux)));
    req.on('error', ko);
  });
}

function repondre(rep, code, donnees) {
  const corps = JSON.stringify(donnees);
  rep.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  rep.end(corps);
}

/* ------------------------------------------------------------
   Publication en ligne (Netlify)
   ------------------------------------------------------------ */

/** Emplacements possibles du jeton de connexion enregistré par Netlify. */
function cheminsConfigNetlify() {
  const app = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  return [
    path.join(app, 'netlify', 'Config', 'config.json'),
    path.join(os.homedir(), '.netlify', 'config.json'),
    path.join(os.homedir(), '.config', 'netlify', 'config.json')
  ];
}

/** Vrai si un compte Netlify est déjà autorisé sur cet ordinateur. */
async function netlifyConnecte() {
  for (const p of cheminsConfigNetlify()) {
    try {
      const brut = JSON.parse(await fsp.readFile(p, 'utf8'));
      const users = brut.users || {};
      if (Object.keys(users).length) return true;
    } catch {}
  }
  return false;
}

/** Lance une commande et récupère toute sa sortie. */
function lancer(commande, args, options = {}) {
  return new Promise(resolve => {
    const p = spawn(commande, args, { cwd: RACINE, shell: true, ...options });
    let sortie = '';
    p.stdout.on('data', d => { sortie += d; process.stdout.write(d); });
    p.stderr.on('data', d => { sortie += d; process.stdout.write(d); });
    p.on('error', e => resolve({ code: -1, sortie: sortie + '\n' + e.message }));
    p.on('close', code => resolve({ code, sortie }));
  });
}

/** Recopie l'application sans les outils de gestion, qui restent locaux. */
async function preparerPublication() {
  await fsp.rm(DOSSIER_PUBLICATION, { recursive: true, force: true });

  const exclu = complet => {
    const rel = path.relative(RACINE, complet).split(path.sep).join('/');
    if (!rel) return false;
    return EXCLUS_DE_LA_PUBLICATION.some(e => rel === e || rel.startsWith(e + '/'))
        || rel.endsWith('.bat');
  };

  await fsp.cp(RACINE, DOSSIER_PUBLICATION, {
    recursive: true,
    filter: src => !exclu(src)
  });

  const fichiers = [];
  const parcourir = async d => {
    for (const e of await fsp.readdir(d, { withFileTypes: true })) {
      const c = path.join(d, e.name);
      if (e.isDirectory()) await parcourir(c); else fichiers.push(c);
    }
  };
  await parcourir(DOSSIER_PUBLICATION);
  const octets = (await Promise.all(fichiers.map(async f => (await fsp.stat(f)).size)))
    .reduce((a, b) => a + b, 0);

  return { nbFichiers: fichiers.length, octets };
}

/* ------------------------------------------------------------
   Le serveur
   ------------------------------------------------------------ */

const serveur = http.createServer(async (req, rep) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const chemin = decodeURIComponent(url.pathname);

  /* --- Contrôle du code d'accès, uniquement en mode réseau --- */
  if (CODE) {
    const protege = chemin.startsWith('/api/') && chemin !== '/api/etat'
                 || chemin === '/admin.html';
    if (protege) {
      const fourni = url.searchParams.get('code') || req.headers['x-code'];
      if (fourni !== CODE) {
        if (chemin.startsWith('/api/')) {
          return repondre(rep, 403, { ok: false, erreur: 'Code d\'accès incorrect ou absent.' });
        }
        rep.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        return rep.end(`<!doctype html><meta charset="utf-8">
          <div style="font-family:system-ui;max-width:520px;margin:60px auto;padding:28px;
                      background:#0B4D3B;color:#fff;border-radius:16px;text-align:center">
            <h1 style="font-family:Georgia,serif">Code d'accès requis</h1>
            <p>Ouvre l'espace de gestion avec le lien complet affiché dans
               la fenêtre noire de <strong>GESTION-TELEPHONE.bat</strong> sur ton ordinateur.</p>
            <p style="opacity:.8;font-size:.9rem">Il ressemble à :<br>
               http://${ipLocale()}:${PORT}/admin.html?code=<strong>123456</strong></p>
          </div>`);
      }
    }
  }

  /* --- Enregistrement du contenu --- */
  if (req.method === 'POST' && chemin === '/api/contenu') {
    try {
      const corps = await lireCorps(req, 8 * 1024 * 1024);
      const texte = corps.toString('utf8');

      // On refuse d'écrire un fichier qui casserait l'application.
      if (!texte.includes('window.CONTENU')) {
        return repondre(rep, 400, { ok: false, erreur: 'Contenu invalide' });
      }
      try { new Function('window', texte)({}); }
      catch (e) { return repondre(rep, 400, { ok: false, erreur: 'JavaScript invalide : ' + e.message }); }

      const cible = path.join(RACINE, 'data', 'contenu.js');
      // Copie de secours avant d'écraser : on garde la version précédente.
      try { await fsp.copyFile(cible, cible + '.precedent'); } catch {}
      await fsp.writeFile(cible, texte, 'utf8');

      console.log(`  ✓ contenu enregistré (${texte.length} caractères)`);
      return repondre(rep, 200, { ok: true, octets: texte.length });
    } catch (e) {
      return repondre(rep, 500, { ok: false, erreur: e.message });
    }
  }

  /* --- Réception d'un fichier vidéo / audio / image --- */
  if (req.method === 'POST' && chemin === '/api/media') {
    const dossier = url.searchParams.get('dossier');
    const nom = nomSur(url.searchParams.get('nom'));

    if (!DOSSIERS_AUTORISES.has(dossier)) return repondre(rep, 400, { ok: false, erreur: 'Dossier non autorisé' });
    if (!nom) return repondre(rep, 400, { ok: false, erreur: 'Nom de fichier invalide' });

    try {
      const corps = await lireCorps(req, 800 * 1024 * 1024);
      const rep_dossier = cheminSur(dossier);
      if (!rep_dossier) return repondre(rep, 400, { ok: false, erreur: 'Chemin refusé' });

      await fsp.mkdir(rep_dossier, { recursive: true });
      await fsp.writeFile(path.join(rep_dossier, nom), corps);

      console.log(`  ✓ ${dossier}/${nom} (${(corps.length / 1048576).toFixed(1)} Mo)`);
      return repondre(rep, 200, { ok: true, chemin: `${dossier}/${nom}`, octets: corps.length });
    } catch (e) {
      return repondre(rep, 500, { ok: false, erreur: e.message });
    }
  }

  /* --- Signale à l'interface que l'enregistrement est possible --- */
  if (chemin === '/api/etat') {
    return repondre(rep, 200, {
      ok: true,
      enregistrementPossible: true,
      dossier: RACINE,
      publicationPossible: await netlifyConnecte(),
      site: SITE_NETLIFY
    });
  }

  /* --- Mise en ligne du site public --- */
  if (req.method === 'POST' && chemin === '/api/publier') {
    if (!(await netlifyConnecte())) {
      return repondre(rep, 400, {
        ok: false,
        erreur: "Aucun compte Netlify autorisé. Double-clique sur CONNEXION-NETLIFY.bat, une seule fois."
      });
    }

    try {
      console.log('\n  → Preparation du paquet...');
      const info = await preparerPublication();
      console.log(`     ${info.nbFichiers} fichiers, ${(info.octets / 1048576).toFixed(1)} Mo`);
      console.log('  → Envoi vers Netlify (cela peut prendre un moment)...\n');

      const r = await lancer('npx', [
        '--yes', 'netlify-cli', 'deploy',
        '--prod',
        '--dir', `"${DOSSIER_PUBLICATION}"`,
        '--site', SITE_NETLIFY,
        '--no-build'
      ]);

      await fsp.rm(DOSSIER_PUBLICATION, { recursive: true, force: true });

      if (r.code !== 0) {
        console.log('\n  ✗ Publication echouee\n');
        return repondre(rep, 500, { ok: false, erreur: 'La publication a échoué.', detail: r.sortie.slice(-1500) });
      }

      const m = r.sortie.match(/https:\/\/[a-z0-9-]+\.netlify\.app/i);
      console.log('\n  ✓ Site publie\n');
      return repondre(rep, 200, {
        ok: true,
        url: m ? m[0] : `https://${SITE_NETLIFY}.netlify.app`,
        nbFichiers: info.nbFichiers,
        octets: info.octets
      });
    } catch (e) {
      await fsp.rm(DOSSIER_PUBLICATION, { recursive: true, force: true }).catch(() => {});
      return repondre(rep, 500, { ok: false, erreur: e.message });
    }
  }

  /* --- Fichiers de l'application --- */
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return repondre(rep, 405, { ok: false, erreur: 'Méthode non autorisée' });
  }

  let relatif = chemin === '/' ? 'index.html' : chemin.replace(/^\/+/, '');
  const complet = cheminSur(relatif);
  if (!complet) { rep.writeHead(403); return rep.end('Accès refusé'); }

  fs.stat(complet, (err, info) => {
    if (err || !info.isFile()) {
      rep.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return rep.end('<h1>404</h1><p>Fichier introuvable : ' + relatif + '</p>');
    }
    rep.writeHead(200, {
      'Content-Type': TYPES[path.extname(complet).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store'          // toujours la version fraîche en local
    });
    if (req.method === 'HEAD') return rep.end();
    fs.createReadStream(complet).pipe(rep);
  });
});

serveur.listen(PORT, ADRESSE, () => {
  console.log('');
  console.log('  ===============================================');
  console.log('    FAALA GEUN - serveur local demarre');
  console.log('  ===============================================');
  console.log('');
  console.log('    Sur CET ordinateur :');
  console.log('      Espace de gestion : http://localhost:' + PORT + '/admin.html');
  console.log('      Application       : http://localhost:' + PORT + '/index.html');

  if (MODE_RESEAU) {
    const ip = ipLocale();
    const lien = `http://${ip}:${PORT}/admin.html?code=${CODE}`;

    // On écrit aussi le lien dans un fichier : plus facile à recopier
    // ou à s'envoyer par message que de le relire dans la fenêtre noire.
    fs.writeFileSync(path.join(RACINE, 'LIEN-TELEPHONE.txt'),
      'ADRESSE A OUVRIR SUR TON TELEPHONE\r\n' +
      '(le telephone doit etre sur le meme Wi-Fi que ce PC)\r\n\r\n' +
      lien + '\r\n\r\n' +
      'CODE D ACCES : ' + CODE + '\r\n\r\n' +
      'Ce lien change a chaque demarrage du serveur.\r\n', 'utf8');

    console.log('');
    console.log('  -----------------------------------------------');
    console.log('    Sur ton TELEPHONE (meme Wi-Fi que ce PC) :');
    console.log('');
    console.log('      http://' + ip + ':' + PORT + '/admin.html?code=' + CODE);
    console.log('');
    console.log('    CODE D ACCES : ' + CODE);
    console.log('');
    console.log('    Ce code change a chaque demarrage.');
    console.log('    Ne le partage qu avec les personnes de confiance.');
    console.log('  -----------------------------------------------');
  }

  console.log('');
  console.log('    Laisse cette fenetre OUVERTE pendant que tu travailles.');
  console.log('    Ferme-la (ou Ctrl+C) pour arreter.');
  console.log('');
});

serveur.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n  ERREUR : le port ${PORT} est deja utilise.`);
    console.error('  Une autre fenetre du serveur est sans doute deja ouverte.\n');
  } else {
    console.error('\n  ERREUR : ' + e.message + '\n');
  }
  process.exit(1);
});
