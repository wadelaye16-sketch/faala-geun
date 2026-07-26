/* ============================================================
   Prepare la version publique du site, dans le dossier dist/.

   Netlify execute ce script a chaque modification du depot,
   puis met en ligne le contenu de dist/.

   Tout ce qui sert uniquement sur ton ordinateur (espace de
   gestion, serveur local, fichiers .bat) est ecarte : ces
   fichiers restent sur GitHub mais ne sont jamais publies.
   ============================================================ */

'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const RACINE = __dirname;
const CIBLE = path.join(RACINE, 'dist');

/** Ne part jamais en ligne. */
const PRIVE = [
  'dist', 'node_modules', '.git', '.github', '.claude', '.netlify', '.publication',
  'admin.html', 'reparer.html', 'serveur.js', 'build.js',
  'assets/css/admin.css', 'assets/js/admin.js',
  'data/contenu.js.precedent',
  'GUIDE.md', 'LIEN-TELEPHONE.txt', '.gitignore', 'netlify.toml'
];

function estPrive(complet) {
  const rel = path.relative(RACINE, complet).split(path.sep).join('/');
  if (!rel) return false;
  if (rel.endsWith('.bat')) return true;
  return PRIVE.some(p => rel === p || rel.startsWith(p + '/'));
}

(async function construire() {
  await fsp.rm(CIBLE, { recursive: true, force: true });
  await fsp.mkdir(CIBLE, { recursive: true });

  let nb = 0, octets = 0;

  async function copier(dossier) {
    for (const e of await fsp.readdir(dossier, { withFileTypes: true })) {
      const source = path.join(dossier, e.name);
      if (estPrive(source)) continue;

      const destination = path.join(CIBLE, path.relative(RACINE, source));
      if (e.isDirectory()) {
        await fsp.mkdir(destination, { recursive: true });
        await copier(source);
      } else {
        await fsp.mkdir(path.dirname(destination), { recursive: true });
        await fsp.copyFile(source, destination);
        octets += (await fsp.stat(source)).size;
        nb++;
      }
    }
  }

  await copier(RACINE);

  // Sans index.html, le site serait vide : mieux vaut echouer bruyamment.
  if (!fs.existsSync(path.join(CIBLE, 'index.html'))) {
    console.error('ERREUR : index.html absent de dist/ — publication interrompue.');
    process.exit(1);
  }

  // Verification : aucun outil local ne doit se retrouver en ligne.
  const interdits = ['admin.html', 'serveur.js', 'reparer.html', 'assets/js/admin.js'];
  const fuites = interdits.filter(f => fs.existsSync(path.join(CIBLE, f)));
  if (fuites.length) {
    console.error('ERREUR : fichiers prives dans dist/ : ' + fuites.join(', '));
    process.exit(1);
  }

  console.log(`Version publique prete : ${nb} fichiers, ${(octets / 1024).toFixed(0)} Ko`);
})();
