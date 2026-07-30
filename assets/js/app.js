/* ============================================================
   Touba Média — logique de l'application
   Tout le contenu vient de data/contenu.json
   ============================================================ */

'use strict';

const ROUTES = ['accueil', 'videos', 'musiques', 'boutique', 'evenements', 'actualites'];
const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const MOIS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                   'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const app = document.getElementById('app');

/** Données chargées depuis data/contenu.json */
let DATA = { site: {}, textes: {}, videos: [], audios: [], boutique: [], evenements: [], actualites: [] };

/** Filtre de catégorie actif, par page */
const filtreActif = { videos: 'Tout', musiques: 'Tout', boutique: 'Tout' };

/** Terme de recherche courant */
let recherche = '';

/* ------------------------------------------------------------
   Utilitaires
   ------------------------------------------------------------ */

/** Échappe le HTML pour éviter toute injection depuis le fichier de contenu. */
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Convertit "2026-08-14" en objet Date locale (évite le décalage UTC). */
function versDate(iso) {
  if (!iso) return null;
  const [a, m, j] = String(iso).split('-').map(Number);
  if (!a || !m || !j) return null;
  return new Date(a, m - 1, j);
}

function dateLongue(iso) {
  const d = versDate(iso);
  return d ? `${d.getDate()} ${MOIS_LONG[d.getMonth()]} ${d.getFullYear()}` : '';
}

function mmss(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Trie du plus récent au plus ancien. */
function parDateDesc(a, b) {
  return String(b.date || '').localeCompare(String(a.date || ''));
}

/** Vrai si l'élément correspond au terme de recherche. */
function correspond(item, terme) {
  if (!terme) return true;
  const t = terme.toLowerCase();
  return ['titre', 'description', 'resume', 'contenu', 'categorie', 'artiste', 'lieu', 'auteur']
    .some(k => String(item[k] || '').toLowerCase().includes(t));
}

/* Titre et sous-titre d'une page.
   Tant que rien n'a été écrit, on propose un texte par défaut. Dès que
   la rubrique « Textes des pages » a été enregistrée une fois, c'est
   toi qui décides — y compris de laisser un sous-titre vide. */
function texteDe(page, titreDefaut, sousDefaut) {
  const t = DATA.textes || {};
  const lire = (cle, defaut) => (t[cle] !== undefined ? t[cle] : defaut);
  return {
    titre: lire(page + 'Titre', titreDefaut) || titreDefaut,
    sous: lire(page + 'Sous', sousDefaut)
  };
}

/** Bloc de tête d'une page, avec titre et sous-titre modifiables. */
function enTete(page, titreDefaut, sousDefaut) {
  const { titre, sous } = texteDe(page, titreDefaut, sousDefaut);
  return `<div class="page-tete">
    <h1>${esc(titre)}</h1>
    ${sous ? `<p>${esc(sous)}</p>` : ''}
  </div>`;
}

/** Liste des catégories présentes dans une collection. */
function categories(liste) {
  return ['Tout', ...new Set(liste.map(x => x.categorie).filter(Boolean))];
}

/** URL d'intégration YouTube si le lien en est un, sinon null. */
function youtube(url) {
  const m = String(url || '').match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0` : null;
}

/* ------------------------------------------------------------
   Chargement des données
   ------------------------------------------------------------ */

/* Le contenu est fourni par data/contenu.js, chargé juste avant ce fichier.
   Ce choix (plutôt qu'un fetch de JSON) permet d'ouvrir l'application
   par simple double-clic, sans serveur. */
function chargerDonnees() {
  const brut = window.CONTENU;

  if (!brut || typeof brut !== 'object') {
    app.innerHTML = `<div class="vide">
      <h2>Contenu introuvable</h2>
      <p>Le fichier <code>data/contenu.js</code> n'a pas pu être lu.</p>
      <p class="meta">Vérifie qu'il commence bien par <code>window.CONTENU = {</code>
      et qu'il se termine par <code>};</code></p>
      <p class="meta">Une virgule en trop ou un guillemet manquant suffit à tout bloquer :
      ouvre le fichier et compare avec les exemples du GUIDE.</p>
    </div>`;
    return false;
  }

  DATA = {
    site: brut.site || {},
    textes: brut.textes || {},
    videos: brut.videos || [],
    audios: brut.audios || [],
    boutique: brut.boutique || [],
    evenements: brut.evenements || [],
    actualites: brut.actualites || []
  };
  appliquerTextesSite();
  return true;
}

/** Remplit les éléments marqués data-bind="site.xxx". */
function appliquerTextesSite() {
  document.querySelectorAll('[data-bind]').forEach(el => {
    const cle = el.dataset.bind.split('.')[1];
    if (DATA.site[cle]) el.textContent = DATA.site[cle];
  });
  if (DATA.site.nom) document.title = `${DATA.site.nom} — Communauté Mouride`;
}

/* ------------------------------------------------------------
   Fragments réutilisables
   ------------------------------------------------------------ */

function carteVideo(v, i) {
  const affiche = v.affiche
    ? `<img src="${esc(v.affiche)}" alt="" loading="lazy">`
    : '';
  return `
  <article class="carte">
    <button class="carte__vignette" data-video="${i}" aria-label="Lire : ${esc(v.titre)}">
      ${affiche}
      <span class="lecture"><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg></span>
      ${v.duree ? `<span class="badge-duree">${esc(v.duree)}</span>` : ''}
    </button>
    <div class="carte__corps">
      <h3>${esc(v.titre)}</h3>
      ${v.description ? `<p>${esc(v.description)}</p>` : ''}
      <div class="carte__pied">
        ${v.categorie ? `<span class="etiquette">${esc(v.categorie)}</span>` : ''}
        ${v.date ? `<span class="meta">${esc(dateLongue(v.date))}</span>` : ''}
      </div>
    </div>
  </article>`;
}

function lignePiste(a, i) {
  const enCours = lecteur.index === i && !audio.paused;
  const surYoutube = !!youtube(a.fichier);
  const cover = a.affiche
    ? `<img class="piste__cover" src="${esc(a.affiche)}" alt="" loading="lazy">`
    : `<span class="piste__cover"></span>`;
  return `
  <button class="piste ${lecteur.index === i ? 'joue' : ''}" data-piste="${i}">
    <span class="piste__num">${surYoutube ? '▶' : enCours ? '♪' : i + 1}</span>
    ${cover}
    <span class="piste__txt">
      <strong>${esc(a.titre)}</strong>
      <small>${esc(a.artiste || a.categorie || '')}</small>
    </span>
    ${a.duree ? `<span class="piste__duree">${esc(a.duree)}</span>` : ''}
  </button>`;
}

function carteEvent(e) {
  const d = versDate(e.date);
  const aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);
  const passe = d ? d < aujourdhui : false;
  const jours = d ? Math.round((d - aujourdhui) / 86400000) : null;

  let rebours = '';
  if (!passe && jours !== null) {
    rebours = jours === 0 ? "Aujourd'hui !" : jours === 1 ? 'Demain' : `Dans ${jours} jours`;
  }

  return `
  <article class="event ${passe ? 'passe' : ''}">
    <div class="event__date">
      <span class="j">${d ? d.getDate() : '?'}</span>
      <span class="m">${d ? MOIS[d.getMonth()] : ''}</span>
    </div>
    <div class="event__corps">
      <h3>${esc(e.titre)}</h3>
      ${e.lieu ? `<span class="event__lieu">
        <svg viewBox="0 0 24 24"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
        ${esc(e.lieu)}${e.heure ? ` · ${esc(e.heure)}` : ''}</span>` : ''}
      ${e.description ? `<p>${esc(e.description)}</p>` : ''}
      ${rebours ? `<span class="compte-rebours">${esc(rebours)}</span>` : ''}
    </div>
  </article>`;
}

function carteActu(n, i) {
  return `
  <article class="actu" data-actu="${i}">
    ${n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy">` : ''}
    <div class="actu__corps">
      <h3>${esc(n.titre)}</h3>
      <div class="actu__meta">${esc(dateLongue(n.date))}${n.auteur ? ` · ${esc(n.auteur)}` : ''}</div>
      ${n.resume ? `<p>${esc(n.resume)}</p>` : ''}
      ${n.contenu ? `<p class="actu__long">${esc(n.contenu)}</p>
        <button class="actu__plus">Lire la suite ▾</button>` : ''}
    </div>
  </article>`;
}

/** Prix formaté à la sénégalaise : 12 500 FCFA */
function prixLisible(v) {
  const n = Number(String(v).replace(/[^0-9]/g, ''));
  if (!n) return String(v || '');
  return n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' FCFA';
}

/* Taux de conversion franc CFA → euro.
   Il est FIXE par traité depuis 1999 : 1 € = 655,957 FCFA.
   Il ne bouge pas, la conversion se fait donc sans service extérieur. */
const FCFA_PAR_EURO = 655.957;

/** Montant en chiffres, ou 0 si la valeur n'en contient aucun. */
function montant(v) {
  return Number(String(v).replace(/[^0-9]/g, '')) || 0;
}

function euroLisible(e) {
  return (e >= 10 ? Math.round(e).toLocaleString('fr-FR')
                  : e.toFixed(2).replace('.', ',')) + ' €';
}

/** Équivalent en euros d'un montant en FCFA : « ≈ 19 € ». */
function prixEnEuros(v) {
  const n = montant(v);
  return n ? '≈ ' + euroLisible(n / FCFA_PAR_EURO) : '';
}

/* Comment afficher le prix d'un article.
   La devise choisie dit dans quelle monnaie le prix a été saisi,
   et ce qui doit apparaître à l'écran. */
function affichagePrix(a) {
  const n = montant(a.prix);
  if (!n) return null;
  const devise = a.devise || 'FCFA + euro';

  if (devise === 'euro') {
    return { principal: euroLisible(n), secondaire: '' };
  }
  if (devise === 'FCFA') {
    return { principal: prixLisible(n), secondaire: '' };
  }
  return { principal: prixLisible(n), secondaire: prixEnEuros(n) };
}

/* Lien de commande WhatsApp, pré-rempli avec le nom de l'article.
   Chaque article peut porter son propre numéro — utile quand plusieurs
   personnes de la dahira vendent. À défaut, on prend le numéro général. */
function lienCommande(article) {
  const num = String(article.whatsapp || DATA.site.whatsapp || '').replace(/[^0-9]/g, '');
  if (!num) return null;
  const p = affichagePrix(article);
  const prix = p ? ` (${p.principal}${p.secondaire ? ' — ' + p.secondaire : ''})` : '';
  const texte = `Asalaa maalekum. Je souhaite commander : ${article.titre}${prix}.`;
  return `https://wa.me/${num}?text=${encodeURIComponent(texte)}`;
}

function carteArticle(a, i) {
  const lien = lienCommande(a);
  const prix = affichagePrix(a);
  const epuise = String(a.disponible).toLowerCase() === 'non';

  return `
  <article class="carte article ${epuise ? 'article--epuise' : ''}">
    ${a.image
      ? `<img class="article__photo" src="${esc(a.image)}" alt="" loading="lazy">`
      : `<div class="article__photo article__photo--vide"></div>`}
    <div class="carte__corps">
      <h3>${esc(a.titre)}</h3>
      ${a.description ? `<p>${esc(a.description)}</p>` : ''}
      <div class="article__pied">
        ${prix ? `<span class="article__prix">${esc(prix.principal)}
            ${prix.secondaire ? `<small class="article__euros">${esc(prix.secondaire)}</small>` : ''}</span>` : ''}
        ${epuise
          ? `<span class="article__epuise">Épuisé</span>`
          : lien
            ? `<a class="btn btn--gold article__commander" href="${esc(lien)}"
                  target="_blank" rel="noopener">Commander</a>`
            : ''}
      </div>
      ${a.categorie || a.vendeur ? `<div class="carte__pied">
        ${a.categorie ? `<span class="etiquette">${esc(a.categorie)}</span>` : ''}
        ${a.vendeur ? `<span class="meta">Vendu par ${esc(a.vendeur)}</span>` : ''}
      </div>` : ''}
    </div>
  </article>`;
}

function messageVide(texte) {
  return `<div class="vide">
    <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="m4 15 5-5 4 4 3-3 4 4"/></svg>
    <p>${texte}</p>
  </div>`;
}

function barreFiltres(page, liste) {
  const cats = categories(liste);
  if (cats.length <= 2) return '';
  return `<div class="filtres">${cats.map(c =>
    `<button class="filtre ${filtreActif[page] === c ? 'actif' : ''}" data-filtre="${esc(c)}">${esc(c)}</button>`
  ).join('')}</div>`;
}

/* ------------------------------------------------------------
   Les pages
   ------------------------------------------------------------ */

const pages = {

  accueil() {
    const s = DATA.site;
    const videos = [...DATA.videos].sort(parDateDesc).slice(0, 4);
    const audios = DATA.audios.slice(0, 5);
    const aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);
    const prochains = DATA.evenements
      .filter(e => { const d = versDate(e.date); return d && d >= aujourdhui; })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .slice(0, 3);
    const actus = [...DATA.actualites].sort(parDateDesc).slice(0, 2);

    return `
    <section class="hero">
      <h1>${esc(s.titreAccueil || 'Bienvenue')}</h1>
      <p>${esc(s.texteAccueil || '')}</p>
      <div class="hero__actions">
        <a class="btn btn--gold" href="#/videos">Voir les vidéos</a>
        <a class="btn btn--ligne" href="#/musiques">Écouter les khassaïdes</a>
      </div>
    </section>

    ${videos.length ? `<section class="section">
      <div class="section__tete"><h2>Dernières vidéos</h2><a href="#/videos">Tout voir →</a></div>
      <div class="grille">${videos.map((v) => carteVideo(v, DATA.videos.indexOf(v))).join('')}</div>
    </section>` : ''}

    ${audios.length ? `<section class="section">
      <div class="section__tete"><h2>À écouter</h2><a href="#/musiques">Tout voir →</a></div>
      ${audios.map((a) => lignePiste(a, DATA.audios.indexOf(a))).join('')}
    </section>` : ''}

    ${prochains.length ? `<section class="section">
      <div class="section__tete"><h2>Prochains événements</h2><a href="#/evenements">Tout voir →</a></div>
      ${prochains.map(carteEvent).join('')}
    </section>` : ''}

    ${actus.length ? `<section class="section">
      <div class="section__tete"><h2>Actualités</h2><a href="#/actualites">Tout voir →</a></div>
      ${actus.map((n) => carteActu(n, DATA.actualites.indexOf(n))).join('')}
    </section>` : ''}

    ${!videos.length && !audios.length && !prochains.length && !actus.length
      ? messageVide("Aucun contenu pour le moment. Ajoute tes vidéos et musiques dans <code>data/contenu.json</code>.")
      : ''}`;
  },

  videos() {
    const cat = filtreActif.videos;
    const liste = DATA.videos
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => (cat === 'Tout' || v.categorie === cat) && correspond(v, recherche))
      .sort((a, b) => parDateDesc(a.v, b.v));

    return `
    ${enTete('videos', 'Vidéos', 'Khassaïdes, conférences et moments forts de la communauté.')}
    ${barreFiltres('videos', DATA.videos)}
    ${liste.length
      ? `<div class="grille">${liste.map(({ v, i }) => carteVideo(v, i)).join('')}</div>`
      : messageVide(
          recherche ? `Aucune vidéo ne correspond à « ${esc(recherche)} ».`
          : DATA.videos.length ? 'Aucune vidéo dans cette catégorie.'
          : 'Les vidéos arrivent bientôt, incha Allah.')}`;
  },

  musiques() {
    const cat = filtreActif.musiques;
    const liste = DATA.audios
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => (cat === 'Tout' || a.categorie === cat) && correspond(a, recherche));

    return `
    ${enTete('musiques', 'Musiques & Khassaïdes', 'Chants religieux, récitations et enregistrements audio.')}
    ${barreFiltres('musiques', DATA.audios)}
    ${liste.length
      ? `<div class="liste-pistes">${liste.map(({ a, i }) => lignePiste(a, i)).join('')}</div>`
      : messageVide(
          recherche ? `Aucun audio ne correspond à « ${esc(recherche)} ».`
          : DATA.audios.length ? 'Aucun audio dans cette catégorie.'
          : 'Les khassaïdes arrivent bientôt, incha Allah.')}`;
  },

  boutique() {
    const cat = filtreActif.boutique || 'Tout';
    const liste = DATA.boutique
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => (cat === 'Tout' || a.categorie === cat) && correspond(a, recherche));

    // On n'alerte que si des articles se retrouvent réellement sans contact.
    const orphelins = DATA.boutique.filter(a => !a.whatsapp && !DATA.site.whatsapp).length;

    return `
    ${enTete('boutique', 'Boutique', 'La commande se fait par WhatsApp.')}
    ${orphelins ? `<div class="avis">
      ${orphelins} article${orphelins > 1 ? 's n\'ont' : " n'a"} aucun numéro WhatsApp :
      le bouton « Commander » y reste caché. Renseigne un numéro général,
      ou un numéro propre à ces articles.
    </div>` : ''}
    ${barreFiltres('boutique', DATA.boutique)}
    ${liste.length
      ? `<div class="grille">${liste.map(({ a, i }) => carteArticle(a, i)).join('')}</div>`
      : messageVide(
          recherche ? `Aucun article ne correspond à « ${esc(recherche)} ».`
          : DATA.boutique.length ? 'Aucun article dans cette catégorie.'
          : 'La boutique ouvrira bientôt, incha Allah.')}`;
  },

  evenements() {
    const aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);
    const tous = DATA.evenements.filter(e => correspond(e, recherche));
    const avenir = tous.filter(e => { const d = versDate(e.date); return d && d >= aujourdhui; })
                       .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const passes = tous.filter(e => { const d = versDate(e.date); return !d || d < aujourdhui; })
                       .sort(parDateDesc);

    return `
    ${enTete('evenements', 'Événements', 'Magal, gamous, ziars et rencontres de la communauté.')}
    ${avenir.length ? `<section class="section">
      <div class="section__tete"><h2>À venir</h2></div>
      ${avenir.map(carteEvent).join('')}
    </section>` : ''}
    ${passes.length ? `<section class="section">
      <div class="section__tete"><h2>Passés</h2></div>
      ${passes.map(carteEvent).join('')}
    </section>` : ''}
    ${!tous.length ? messageVide(recherche
        ? `Aucun événement ne correspond à « ${esc(recherche)} ».`
        : 'Le calendrier sera publié prochainement.') : ''}`;
  },

  actualites() {
    const liste = DATA.actualites
      .map((n, i) => ({ n, i }))
      .filter(({ n }) => correspond(n, recherche))
      .sort((a, b) => parDateDesc(a.n, b.n));

    return `
    ${enTete('actualites', 'Actualités', 'Annonces et nouvelles de la communauté.')}
    ${liste.length
      ? liste.map(({ n, i }) => carteActu(n, i)).join('')
      : messageVide('Aucune actualité pour le moment.')}`;
  },

  /* Page affichée pendant une recherche : elle balaie TOUTES les rubriques. */
  resultats() {
    const videos = DATA.videos.map((v, i) => ({ v, i })).filter(({ v }) => correspond(v, recherche));
    const audios = DATA.audios.map((a, i) => ({ a, i })).filter(({ a }) => correspond(a, recherche));
    const events = DATA.evenements.filter(e => correspond(e, recherche));
    const actus = DATA.actualites.map((n, i) => ({ n, i })).filter(({ n }) => correspond(n, recherche));
    const total = videos.length + audios.length + events.length + actus.length;

    return `
    <div class="page-tete">
      <h1>Recherche</h1>
      <p>${total} résultat${total > 1 ? 's' : ''} pour « ${esc(recherche)} »</p>
    </div>

    ${videos.length ? `<section class="section">
      <div class="section__tete"><h2>Vidéos</h2></div>
      <div class="grille">${videos.map(({ v, i }) => carteVideo(v, i)).join('')}</div>
    </section>` : ''}

    ${audios.length ? `<section class="section">
      <div class="section__tete"><h2>Musiques</h2></div>
      ${audios.map(({ a, i }) => lignePiste(a, i)).join('')}
    </section>` : ''}

    ${events.length ? `<section class="section">
      <div class="section__tete"><h2>Événements</h2></div>
      ${events.sort(parDateDesc).map(carteEvent).join('')}
    </section>` : ''}

    ${actus.length ? `<section class="section">
      <div class="section__tete"><h2>Actualités</h2></div>
      ${actus.map(({ n, i }) => carteActu(n, i)).join('')}
    </section>` : ''}

    ${!total ? messageVide(`Rien trouvé pour « ${esc(recherche)} ».<br>Essaie un autre mot.`) : ''}`;
  }
};

/* ------------------------------------------------------------
   Routeur
   ------------------------------------------------------------ */

function routeCourante() {
  const r = location.hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES.includes(r) ? r : 'accueil';
}

function afficher() {
  const route = routeCourante();
  // Une recherche en cours remplace la page par les résultats globaux.
  app.innerHTML = recherche ? pages.resultats() : pages[route]();

  // Photo de couverture du bandeau d'accueil, si elle est renseignée.
  const bandeau = app.querySelector('.hero');
  if (bandeau && DATA.site.couverture) {
    bandeau.classList.add('hero--photo');
    bandeau.style.backgroundImage =
      `linear-gradient(rgba(6,52,38,.72), rgba(6,52,38,.92)), url("${DATA.site.couverture}")`;
  }

  document.querySelectorAll('[data-route]').forEach(a =>
    a.classList.toggle('actif', !recherche && a.dataset.route === route));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Changer de page annule la recherche en cours.
window.addEventListener('hashchange', () => {
  if (recherche) { recherche = ''; champRecherche.value = ''; barreRecherche.hidden = true; }
  afficher();
});

/* ------------------------------------------------------------
   Lecteur audio persistant
   ------------------------------------------------------------ */

const audio = document.getElementById('audio');
const elPlayer = document.getElementById('player');
const elSeek = document.getElementById('player-seek');
const icPlay = document.getElementById('ic-play');
const icPause = document.getElementById('ic-pause');

const lecteur = { index: -1 };

function jouerPiste(i) {
  const a = DATA.audios[i];
  if (!a || !a.fichier) return;

  /* Une adresse YouTube n'est pas un fichier son : l'élément audio ne sait
     pas la lire. On l'ouvre donc dans le lecteur vidéo, qui sait le faire. */
  if (youtube(a.fichier)) {
    audio.pause();
    ouvrirMedia({ titre: a.titre, description: a.artiste || '', fichier: a.fichier });
    return;
  }

  if (lecteur.index === i) {           // même piste : bascule lecture/pause
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
    return;
  }

  lecteur.index = i;
  audio.src = a.fichier;
  audio.play().catch(err => console.warn('Lecture impossible :', err));

  elPlayer.hidden = false;
  document.getElementById('player-title').textContent = a.titre || '';
  document.getElementById('player-artist').textContent = a.artiste || a.categorie || '';
  document.getElementById('player-cover').src = a.affiche || 'assets/icons/icon.svg';

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: a.titre || '',
      artist: a.artiste || DATA.site.nom || '',
      album: a.categorie || ''
    });
  }
  majPistes();
}

function pisteSuivante(pas) {
  if (!DATA.audios.length) return;
  jouerPiste((lecteur.index + pas + DATA.audios.length) % DATA.audios.length);
}

/** Rafraîchit l'état visuel des pistes sans re-rendre toute la page. */
function majPistes() {
  document.querySelectorAll('[data-piste]').forEach(el => {
    const i = Number(el.dataset.piste);
    const actif = i === lecteur.index;
    el.classList.toggle('joue', actif);
    const num = el.querySelector('.piste__num');
    // Le triangle des pistes YouTube doit survivre au rafraîchissement,
    // sinon le repère posé à l'affichage disparaît aussitôt.
    if (num) {
      num.textContent = youtube(DATA.audios[i]?.fichier) ? '▶'
                      : (actif && !audio.paused) ? '♪' : i + 1;
    }
  });
}

function majIcones() {
  icPlay.hidden = !audio.paused;
  icPause.hidden = audio.paused;
  majPistes();
}

audio.addEventListener('play', majIcones);
audio.addEventListener('pause', majIcones);
audio.addEventListener('ended', () => pisteSuivante(1));
audio.addEventListener('error', () => {
  document.getElementById('player-artist').textContent = 'Fichier introuvable';
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    elSeek.value = Math.round((audio.currentTime / audio.duration) * 1000);
  }
  document.getElementById('player-cur').textContent = mmss(audio.currentTime);
});
audio.addEventListener('loadedmetadata', () => {
  document.getElementById('player-dur').textContent = mmss(audio.duration);
});

elSeek.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (elSeek.value / 1000) * audio.duration;
});

document.getElementById('player-play').onclick = () =>
  audio.paused ? audio.play().catch(() => {}) : audio.pause();
document.getElementById('player-next').onclick = () => pisteSuivante(1);
document.getElementById('player-prev').onclick = () =>
  audio.currentTime > 3 ? (audio.currentTime = 0) : pisteSuivante(-1);
document.getElementById('player-close').onclick = () => {
  audio.pause();
  elPlayer.hidden = true;
  lecteur.index = -1;
  majPistes();
};

/* ------------------------------------------------------------
   Fenêtre vidéo
   ------------------------------------------------------------ */

const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modal-media');

/** Ouvre le lecteur plein écran, pour une vidéo comme pour un lien YouTube. */
function ouvrirMedia(v) {
  if (!v) return;

  audio.pause();
  const embed = youtube(v.fichier);
  modalMedia.innerHTML = embed
    ? `<iframe src="${esc(embed)}" allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
         allowfullscreen title="${esc(v.titre)}"></iframe>`
    : `<video src="${esc(v.fichier)}" controls autoplay playsinline
         ${v.affiche ? `poster="${esc(v.affiche)}"` : ''}></video>`;

  document.getElementById('modal-title').textContent = v.titre || '';
  document.getElementById('modal-desc').textContent = v.description || '';
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function ouvrirVideo(i) { ouvrirMedia(DATA.videos[i]); }

function fermerVideo() {
  modalMedia.innerHTML = '';       // stoppe la lecture
  modal.hidden = true;
  document.body.style.overflow = '';
}

modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) fermerVideo(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!modal.hidden) fermerVideo(); else fermerRecherche(); }
});

/* ------------------------------------------------------------
   Clics délégués dans la zone de contenu
   ------------------------------------------------------------ */

app.addEventListener('click', e => {
  const vignette = e.target.closest('[data-video]');
  if (vignette) return ouvrirVideo(Number(vignette.dataset.video));

  const piste = e.target.closest('[data-piste]');
  if (piste) return jouerPiste(Number(piste.dataset.piste));

  const filtre = e.target.closest('[data-filtre]');
  if (filtre) {
    filtreActif[routeCourante()] = filtre.dataset.filtre;
    return afficher();
  }

  const plus = e.target.closest('.actu__plus');
  if (plus) {
    const carte = plus.closest('.actu');
    const ouvert = carte.classList.toggle('ouvert');
    plus.textContent = ouvert ? 'Réduire ▴' : 'Lire la suite ▾';
  }
});

/* ------------------------------------------------------------
   Recherche
   ------------------------------------------------------------ */

const barreRecherche = document.getElementById('searchbar');
const champRecherche = document.getElementById('search-input');

function fermerRecherche() {
  if (barreRecherche.hidden) return;
  barreRecherche.hidden = true;
  champRecherche.value = '';
  recherche = '';
  afficher();
}

document.getElementById('btn-search').onclick = () => {
  barreRecherche.hidden = !barreRecherche.hidden;
  if (!barreRecherche.hidden) champRecherche.focus();
  else fermerRecherche();
};
document.getElementById('search-close').onclick = fermerRecherche;

let minuteur;
champRecherche.addEventListener('input', () => {
  clearTimeout(minuteur);
  minuteur = setTimeout(() => {
    recherche = champRecherche.value.trim();
    afficher();
  }, 220);
});

/* ------------------------------------------------------------
   Thème clair / sombre
   ------------------------------------------------------------ */

function appliquerTheme(t) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', t === 'sombre' ? '#0C1310' : '#0B4D3B');
  try { localStorage.setItem('theme', t); } catch {}
}

appliquerTheme(
  (() => {
    try { return localStorage.getItem('theme'); } catch { return null; }
  })() ||
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair')
);

document.getElementById('btn-theme').onclick = () =>
  appliquerTheme(document.documentElement.dataset.theme === 'sombre' ? 'clair' : 'sombre');

/* ------------------------------------------------------------
   Installation de l'application (PWA)
   ------------------------------------------------------------ */

const btnInstall = document.getElementById('btn-install');
let invite;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  invite = e;
  btnInstall.hidden = false;
});

btnInstall.onclick = async () => {
  if (!invite) return;
  invite.prompt();
  await invite.userChoice;
  invite = null;
  btnInstall.hidden = true;
};

window.addEventListener('appinstalled', () => { btnInstall.hidden = true; });

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW :', e)));
}

/* ------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------ */

document.getElementById('year').textContent = new Date().getFullYear();

if (chargerDonnees()) afficher();
