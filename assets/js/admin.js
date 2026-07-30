/* ============================================================
   Espace de gestion — ajoute et modifie le contenu de l'app
   sans jamais ouvrir un fichier de code.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   Description des rubriques et de leurs champs
   ------------------------------------------------------------ */

const SECTIONS = {
  site: {
    titre: 'Informations du site',
    sousTitre: "Le nom et les textes affichés en haut de l'application.",
    objet: true,
    champs: [
      { cle: 'nom', label: "Nom de l'application", type: 'texte', requis: true },
      { cle: 'slogan', label: 'Sous-titre', type: 'texte', aide: 'Affiché en petit sous le nom.' },
      { cle: 'couverture', label: "Photo de couverture", type: 'media', accept: 'image/*',
        dossier: 'medias/images',
        aide: "Photo affichée en fond du bandeau d'accueil. Format paysage conseillé (1600×900)." },
      { cle: 'whatsapp', label: 'Numéro WhatsApp de la boutique', type: 'texte',
        aide: "Avec l'indicatif du pays, sans espaces. Exemple : 221771234567. " +
              "Sans ce numéro, le bouton « Commander » n'apparaît pas." },
      { cle: 'titreAccueil', label: "Titre de la page d'accueil", type: 'texte' },
      { cle: 'texteAccueil', label: "Texte de bienvenue", type: 'zone' },
      { cle: 'pied', label: 'Texte du bas de page', type: 'texte' }
    ]
  },

  videos: {
    titre: 'Vidéos',
    sousTitre: 'Khassaïdes, conférences et moments forts de la communauté.',
    singulier: 'une vidéo',
    vignette: 'affiche',
    champs: [
      { cle: 'titre', label: 'Titre', type: 'texte', requis: true },
      { cle: 'description', label: 'Description', type: 'zone' },
      { cle: 'categorie', label: 'Catégorie', type: 'texte', liste: true,
        aide: 'Crée un bouton de filtre dans l\'app. Ex. : Khassaïda, Conférence, Événement.' },
      { cle: 'date', label: 'Date', type: 'date' },
      { cle: 'duree', label: 'Durée', type: 'texte', aide: 'Ex. : 18:24' },
      { cle: 'fichier', label: 'Fichier vidéo', type: 'media', accept: 'video/*',
        dossier: 'medias/videos', requis: true,
        aide: 'Choisis un fichier MP4 — ou colle un lien YouTube.' },
      { cle: 'affiche', label: 'Image de couverture', type: 'media', accept: 'image/*',
        dossier: 'medias/images', aide: 'Facultatif. Une photo en 1280×720 pixels convient bien.' }
    ]
  },

  audios: {
    titre: 'Musiques & Khassaïdes',
    sousTitre: 'Chants religieux, récitations et causeries.',
    singulier: 'une musique',
    vignette: 'affiche',
    champs: [
      { cle: 'titre', label: 'Titre', type: 'texte', requis: true },
      { cle: 'artiste', label: 'Interprète', type: 'texte', aide: 'Ex. : Kurel de la dahira' },
      { cle: 'categorie', label: 'Catégorie', type: 'texte', liste: true },
      { cle: 'duree', label: 'Durée', type: 'texte', aide: 'Ex. : 12:30' },
      { cle: 'fichier', label: 'Fichier audio', type: 'media', accept: 'audio/*',
        dossier: 'medias/audios', requis: true, aide: 'Choisis un fichier MP3.' },
      { cle: 'affiche', label: 'Pochette', type: 'media', accept: 'image/*',
        dossier: 'medias/images', aide: 'Facultatif.' }
    ]
  },

  boutique: {
    titre: 'Boutique',
    sousTitre: 'Articles proposés par la dahira. La commande se fait par WhatsApp.',
    singulier: 'un article',
    vignette: 'image',
    champs: [
      { cle: 'titre', label: "Nom de l'article", type: 'texte', requis: true },
      { cle: 'description', label: 'Description', type: 'zone' },
      { cle: 'prix', label: 'Prix en FCFA', type: 'texte',
        aide: "Chiffres seulement. Exemple : 12500 — affiché « 12 500 FCFA » " +
              "avec l'équivalent en euros calculé automatiquement (≈ 19 €)." },
      { cle: 'categorie', label: 'Catégorie', type: 'texte', liste: true,
        aide: 'Ex. : Livres, Chapelets, Tissus, Khassaïdes imprimés.' },
      { cle: 'disponible', label: 'Disponible ?', type: 'choix',
        options: ['oui', 'non'], aide: '« non » affiche « Épuisé » et masque le bouton.' },
      { cle: 'whatsapp', label: 'Numéro WhatsApp du vendeur', type: 'texte',
        aide: "Facultatif. Format 221771234567. Laisse vide pour utiliser " +
              "le numéro général de la boutique." },
      { cle: 'vendeur', label: 'Nom du vendeur', type: 'texte',
        aide: 'Facultatif. Affiché sous le prix.' },
      { cle: 'image', label: 'Photo', type: 'media', accept: 'image/*',
        dossier: 'medias/images', aide: 'Photo carrée de préférence.' }
    ]
  },

  evenements: {
    titre: 'Événements',
    sousTitre: 'Magal, gamous, ziars et rencontres.',
    singulier: 'un événement',
    champs: [
      { cle: 'titre', label: 'Titre', type: 'texte', requis: true },
      { cle: 'date', label: 'Date', type: 'date', requis: true },
      { cle: 'heure', label: 'Heure', type: 'texte', aide: 'Ex. : 18h00 — ou « Toute la journée »' },
      { cle: 'lieu', label: 'Lieu', type: 'texte' },
      { cle: 'description', label: 'Description', type: 'zone' }
    ]
  },

  actualites: {
    titre: 'Actualités',
    sousTitre: 'Annonces et nouvelles de la communauté.',
    singulier: 'une actualité',
    vignette: 'image',
    champs: [
      { cle: 'titre', label: 'Titre', type: 'texte', requis: true },
      { cle: 'date', label: 'Date', type: 'date', requis: true },
      { cle: 'auteur', label: 'Auteur', type: 'texte' },
      { cle: 'resume', label: 'Résumé', type: 'zone', aide: 'La phrase courte visible directement.' },
      { cle: 'contenu', label: 'Texte complet', type: 'zone',
        aide: 'Caché derrière « Lire la suite ». Laisse une ligne vide pour séparer les paragraphes.' },
      { cle: 'image', label: 'Image', type: 'media', accept: 'image/*', dossier: 'medias/images' }
    ]
  }
};

/* ------------------------------------------------------------
   État
   ------------------------------------------------------------ */

const VIDE = { site: {}, videos: [], audios: [], boutique: [], evenements: [], actualites: [] };

/** Copie de travail du contenu. */
let D = fusionner(window.CONTENU);

let sectionActive = 'site';
let modifie = false;

/** Fichiers choisis en attente de copie (quand le dossier n'est pas connecté). */
const aCopier = new Map();

function fusionner(brut) {
  const d = JSON.parse(JSON.stringify(VIDE));
  if (brut && typeof brut === 'object') {
    d.site = { ...brut.site };
    for (const k of ['videos', 'audios', 'boutique', 'evenements', 'actualites']) {
      if (Array.isArray(brut[k])) d[k] = JSON.parse(JSON.stringify(brut[k]));
    }
  }
  return d;
}

/* ------------------------------------------------------------
   Petits utilitaires
   ------------------------------------------------------------ */

const $ = s => document.querySelector(s);

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Nettoie un nom de fichier : accents, espaces et caractères spéciaux. */
function nettoyerNom(nom) {
  return nom
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // retire les accents
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-+\./g, '.')     // pas de tiret juste avant l'extension
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function estLien(v) { return /^https?:\/\//i.test(String(v || '')); }

let minuteurMessage;
function annoncer(texte, genre = '') {
  const el = $('#message');
  el.textContent = texte;
  el.className = 'message' + (genre ? ' message--' + genre : '');
  el.hidden = false;
  clearTimeout(minuteurMessage);
  minuteurMessage = setTimeout(() => { el.hidden = true; }, genre === 'erreur' ? 7000 : 3800);
}

function marquerModifie() {
  modifie = true;
  // Horodaté : un brouillon ancien ne doit jamais écraser un contenu plus récent.
  try {
    localStorage.setItem('touba-brouillon',
      JSON.stringify({ quand: Date.now(), donnees: D }));
  } catch {}
}

window.addEventListener('beforeunload', e => {
  if (modifie) { e.preventDefault(); e.returnValue = ''; }
});

/* ------------------------------------------------------------
   Liaison avec le serveur local (serveur.js)

   C'est lui qui écrit sur le disque. Aucune autorisation à
   accorder, et ça fonctionne dans tous les navigateurs.
   ------------------------------------------------------------ */

/** Vrai quand la page est servie par serveur.js (et non ouverte en file://). */
let serveurActif = false;

/* Code d'accès du mode téléphone. Il arrive dans l'adresse (?code=123456),
   on le retient pour ne pas avoir à le retaper à chaque fois. */
const CODE = (() => {
  const dansUrl = new URLSearchParams(location.search).get('code');
  if (dansUrl) { try { sessionStorage.setItem('code', dansUrl); } catch {} return dansUrl; }
  try { return sessionStorage.getItem('code') || ''; } catch { return ''; }
})();

/** fetch() qui joint automatiquement le code d'accès. */
function requete(url, options = {}) {
  const entetes = { ...(options.headers || {}) };
  if (CODE) entetes['x-code'] = CODE;
  return fetch(url, { ...options, headers: entetes });
}

/** Vrai quand un compte Netlify est autorisé : la publication en un clic marche. */
let publicationPossible = false;

async function testerServeur() {
  if (!location.protocol.startsWith('http')) return false;
  try {
    const r = await fetch('api/etat', { cache: 'no-store' });
    if (!r.ok) return false;
    const d = await r.json();
    publicationPossible = d.publicationPossible === true;
    return d.enregistrementPossible === true;
  } catch { return false; }
}

/** Envoie le site en ligne, pour toute la communauté. */
async function publier() {
  if (modifie && !confirm(
      "Tu as des modifications non enregistrées.\n\n" +
      "Elles ne partiront pas en ligne. Publier quand même ?")) return;

  const b = $('#btn-publier');
  b.disabled = true;
  b.textContent = '⏳ Publication…';
  annoncer("Envoi vers le site public… cela peut prendre une minute.", 'info');

  try {
    const r = await requete('api/publier', { method: 'POST' });
    const d = await r.json().catch(() => ({}));

    if (!r.ok || !d.ok) {
      annoncer(d.erreur || `Publication impossible (erreur ${r.status})`, 'erreur');
      if (d.detail) console.error(d.detail);
      return;
    }

    annoncer('✓ ' + (d.message || 'Envoyé.'));
    if (!d.rienAPublier) {
      setTimeout(() => {
        if (confirm("Envoyé sur internet.\n\nLe site public sera à jour dans une minute environ :\n" +
                    d.url + "\n\nL'ouvrir maintenant ?")) window.open(d.url, '_blank');
      }, 800);
    }
  } catch (e) {
    annoncer('Publication impossible : ' + e.message, 'erreur');
  } finally {
    b.disabled = false;
    b.textContent = '🌍 Publier en ligne';
  }
}

function majEtatServeur() {
  const el = $('#etat-dossier');
  if (serveurActif) {
    el.textContent = '✓ Enregistrement direct';
    el.title = "Tes modifications sont écrites dans le dossier de l'application, sur cet ordinateur.";
  } else if (modeGitHub) {
    el.textContent = '🌍 En ligne';
    el.title = "Tes modifications partent sur internet : le site public se met à jour tout seul.";
  } else {
    el.textContent = 'Mode téléchargement';
    el.title = "Ouvre l'interface avec GESTION.bat pour enregistrer directement.";
  }
  el.className = 'pastille ' + (serveurActif || modeGitHub ? 'pastille--on' : 'pastille--off');
}

/** Écran de connexion affiché en ligne tant qu'aucun jeton valide n'est enregistré. */
function demanderJeton(messageErreur) {
  // Tant qu'on n'est pas connecté, ces boutons n'ont aucun sens :
  // les laisser visibles laisse croire que l'enregistrement est possible.
  $('#btn-enregistrer').hidden = true;
  $('#btn-publier').hidden = true;
  $('#etat-dossier').textContent = 'Non connecté';
  $('#etat-dossier').className = 'pastille pastille--off';

  document.querySelector('.mise-en-page').innerHTML = `
    <div class="panneau" style="grid-column:1/-1">
      <div class="fiche" style="display:block; padding:26px; max-width:620px; margin:0 auto">
        <h1 style="margin-top:0">Espace de gestion en ligne</h1>
        <p style="color:var(--texte-doux)">
          Pour modifier ton site depuis ce téléphone, colle ci-dessous ta clé personnelle GitHub.
          Elle reste enregistrée sur cet appareil : tu ne la saisiras qu'une fois.
        </p>
        ${messageErreur ? `<p class="alerte-fichier">${esc(messageErreur)}</p>` : ''}
        <div class="champ">
          <label for="saisie-jeton">Clé personnelle</label>
          <input type="text" id="saisie-jeton" placeholder="github_pat_..." autocomplete="off"
                 autocapitalize="off" autocorrect="off" spellcheck="false">
        </div>
        <button id="valider-jeton" class="bouton bouton--or">Se connecter</button>

        <details style="margin-top:22px" open>
          <summary style="cursor:pointer; font-weight:700">Comment obtenir ma clé</summary>

          <p style="color:var(--texte-doux); font-size:.92rem">
            <strong>D'abord :</strong> assure-toi d'être connecté sur GitHub avec le compte
            <code>${esc(GH.proprietaire)}</code>. Une clé créée depuis un autre compte
            sera refusée.</p>

          <ol style="color:var(--texte-doux); font-size:.92rem; line-height:1.8; padding-left:20px">
            <li>Ouvre <a href="https://github.com/settings/tokens/new?scopes=repo&description=FAALA%20GEUN"
                target="_blank" rel="noopener"><strong>cette page</strong></a> —
                le nom et la case sont déjà remplis.</li>
            <li><strong>Expiration</strong> : choisis <code>No expiration</code></li>
            <li>Vérifie que la case <code>repo</code> est bien cochée</li>
            <li>Tout en bas : bouton vert <strong>Generate token</strong></li>
            <li>Copie la clé affichée (elle commence par <code>ghp_</code>)
                et colle-la ci-dessus</li>
          </ol>

          <p style="color:var(--texte-doux); font-size:.88rem">
            GitHub n'affiche cette clé qu'une seule fois. Elle reste ensuite sur ton
            téléphone. Si tu le perds, supprime-la depuis GitHub : elle cesse
            aussitôt de fonctionner.</p>
        </details>
      </div>
    </div>`;

  $('#valider-jeton').onclick = async () => {
    const v = $('#saisie-jeton').value.trim();
    if (!v) return;
    definirJeton(v);
    $('#valider-jeton').disabled = true;
    $('#valider-jeton').textContent = 'Vérification…';
    if (await verifierJeton()) location.reload();
    else {
      definirJeton('');
      demanderJeton(motifRefusJeton || "Cette clé ne fonctionne pas. Reprends les étapes ci-dessous.");
    }
  };
}

/* ------------------------------------------------------------
   Mode en ligne : écriture directe sur GitHub

   Utilisé quand l'interface est ouverte depuis le site public
   (donc sans serveur local) : depuis un téléphone, en 4G,
   n'importe où. Netlify republie tout seul ensuite.
   ------------------------------------------------------------ */

const GH = {
  proprietaire: 'wadelaye16-sketch',
  depot: 'faala-geun',
  branche: 'main'
};

/** Vrai quand on travaille via GitHub (pas de serveur local disponible). */
let modeGitHub = false;

function jeton() {
  try { return localStorage.getItem('gh-jeton') || ''; } catch { return ''; }
}

function definirJeton(v) {
  try { v ? localStorage.setItem('gh-jeton', v) : localStorage.removeItem('gh-jeton'); } catch {}
}

/** Encode du texte UTF-8 en base64, comme l'exige l'API GitHub. */
function enBase64(texte) {
  const octets = new TextEncoder().encode(texte);
  let binaire = '';
  for (const o of octets) binaire += String.fromCharCode(o);
  return btoa(binaire);
}

/** Encode un fichier binaire (audio, image, vidéo) en base64. */
function fichierEnBase64(fichier) {
  return new Promise((ok, ko) => {
    const l = new FileReader();
    l.onload = () => ok(String(l.result).split(',')[1]);
    l.onerror = () => ko(new Error('Lecture du fichier impossible'));
    l.readAsDataURL(fichier);
  });
}

/** Traduit les réponses de GitHub en explications utilisables. */
function expliquer(code, message) {
  if (code === 401) {
    return "Clé refusée (401). Elle est peut-être expirée ou mal recopiée — " +
           "vérifie qu'il n'y a ni espace ni retour à la ligne au début ou à la fin.";
  }
  if (code === 403) {
    return "Écriture interdite (403). Ta clé n'a pas la permission " +
           "« Contents : Read and write » sur le projet faala-geun.";
  }
  if (code === 404) {
    return "Projet introuvable (404). C'est presque toujours l'un de ces deux oublis :\n" +
           "• la clé n'a pas coché le projet faala-geun (Repository access)\n" +
           "• la permission Contents est restée sur « Read-only » au lieu de « Read and write »\n\n" +
           "GitHub répond « introuvable » plutôt que « interdit » dans ces cas-là.";
  }
  if (code === 409 || code === 422) {
    return "Conflit (" + code + "). Le contenu a changé entre-temps. " +
           "Recharge la page et refais ta modification.";
  }
  return `${message || 'erreur inconnue'} (code ${code})`;
}

async function apiGitHub(chemin, options = {}) {
  const r = await fetch(`https://api.github.com/repos/${GH.proprietaire}/${GH.depot}${chemin}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${jeton()}`,
      'Accept': 'application/vnd.github+json',
      ...(options.headers || {})
    }
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(expliquer(r.status, d.message));
    e.code = r.status;
    throw e;
  }
  return d;
}

/** Écrit (ou remplace) un fichier dans le dépôt. */
async function ecrireSurGitHub(chemin, contenuBase64, message) {
  let sha;
  try {
    const actuel = await apiGitHub(`/contents/${chemin}?ref=${GH.branche}`);
    sha = actuel.sha;                       // absent si le fichier est nouveau
  } catch {}

  return apiGitHub(`/contents/${chemin}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: contenuBase64,
      branch: GH.branche,
      ...(sha ? { sha } : {})
    })
  });
}

/** Dernier motif de refus de la clé, pour l'afficher à l'utilisateur. */
let motifRefusJeton = '';

/** Compte GitHub auquel appartient la clé enregistrée. */
let compteDeLaCle = '';

/* Vérifie la clé en tentant une VRAIE écriture, puis en effaçant la trace.
   C'est le seul contrôle fiable : GitHub répond que l'utilisateur a le droit
   d'écrire même quand la clé, elle, ne l'a pas. */
async function verifierJeton() {
  motifRefusJeton = '';
  compteDeLaCle = '';
  if (!jeton()) return false;

  // 1. À quel compte appartient cette clé ?
  try {
    const u = await (await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${jeton()}`, Accept: 'application/vnd.github+json' }
    })).json();
    compteDeLaCle = u.login || '';
  } catch {}

  if (compteDeLaCle && compteDeLaCle.toLowerCase() !== GH.proprietaire.toLowerCase()) {
    motifRefusJeton =
      `Cette clé appartient au compte GitHub « ${compteDeLaCle} », ` +
      `alors que le projet appartient à « ${GH.proprietaire} ».\n\n` +
      `Connecte-toi sur GitHub avec le compte ${GH.proprietaire} avant de créer la clé.`;
    return false;
  }

  // 2. Peut-elle réellement écrire ?
  try {
    const r = await ecrireSurGitHub('.verification-cle.txt',
      enBase64('verification ' + new Date().toISOString()), 'Verification de la cle');
    try {
      await apiGitHub('/contents/.verification-cle.txt', {
        method: 'DELETE',
        body: JSON.stringify({ message: 'Nettoyage verification', sha: r.content.sha, branch: GH.branche })
      });
    } catch {}
    return true;
  } catch (e) {
    motifRefusJeton = e.message;
    return false;
  }
}

/** Envoie un fichier vidéo / audio / image au serveur, qui le range. */
async function envoyerMedia(fichier, dossierCible, nom) {
  const url = `api/media?dossier=${encodeURIComponent(dossierCible)}&nom=${encodeURIComponent(nom)}`;
  const r = await requete(url, { method: 'POST', body: fichier });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok) throw new Error(d.erreur || `erreur ${r.status}`);
  return d;
}

/* ------------------------------------------------------------
   Enregistrement
   ------------------------------------------------------------ */

function genererFichier() {
  return `/* ============================================================
   Contenu de l'application Touba Média.
   Fichier produit par l'espace de gestion (admin.html).
   Tu peux le modifier à la main, mais l'interface est plus sûre.
   Dernière mise à jour : ${new Date().toLocaleString('fr-FR')}
   ============================================================ */

window.CONTENU = ${JSON.stringify(D, null, 2)};
`;
}

function telecharger(texte) {
  const url = URL.createObjectURL(new Blob([texte], { type: 'text/javascript' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'contenu.js';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function enregistrer() {
  const texte = genererFichier();
  const bouton = $('#btn-enregistrer');

  // 1. Serveur local disponible : écriture directe, sans aucune question.
  if (serveurActif) {
    bouton.disabled = true;
    bouton.textContent = 'Enregistrement…';
    try {
      const r = await requete('api/contenu', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: texte
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.erreur || `erreur ${r.status}`);

      modifie = false;
      try { localStorage.removeItem('touba-brouillon'); } catch {}
      annoncer("✓ Enregistré dans l'application. Rafraîchis-la pour voir le résultat.");
    } catch (e) {
      annoncer('Enregistrement impossible : ' + e.message, 'erreur');
    } finally {
      bouton.disabled = false;
      bouton.textContent = '💾 Enregistrer';
    }
    return;
  }

  // 2. Mode en ligne : on écrit dans le dépôt, le site se republie seul.
  if (modeGitHub) {
    bouton.disabled = true;
    bouton.textContent = 'Enregistrement…';
    try {
      await ecrireSurGitHub('data/contenu.js', enBase64(texte),
        'Mise a jour du contenu depuis l espace de gestion');
      modifie = false;
      try { localStorage.removeItem('touba-brouillon'); } catch {}
      annoncer('✓ Enregistré. Le site public sera à jour dans une minute environ.');
    } catch (e) {
      // Message bloquant : sur un téléphone, une bulle qui s'efface passe inaperçue.
      alert("L'enregistrement a échoué.\n\n" + e.message +
            "\n\nTes modifications ne sont pas perdues : elles restent à l'écran. " +
            "Corrige la clé, puis clique de nouveau sur Enregistrer.");
      annoncer('Enregistrement impossible : ' + e.message, 'erreur');
    } finally {
      bouton.disabled = false;
      bouton.textContent = '💾 Enregistrer';
    }
    return;
  }

  // 3. Sinon (page ouverte sans serveur ni jeton) : téléchargement du fichier.
  telecharger(texte);
  modifie = false;
  annoncer("Fichier téléchargé. Pour enregistrer directement la prochaine fois, " +
           "ouvre l'interface avec GESTION.bat.", 'info');
}

/* ------------------------------------------------------------
   Affichage des listes
   ------------------------------------------------------------ */

function categoriesConnues(nom) {
  return [...new Set((D[nom] || []).map(x => x.categorie).filter(Boolean))];
}

function afficherSection(nom) {
  sectionActive = nom;
  document.querySelectorAll('.menu__item').forEach(b =>
    b.classList.toggle('actif', b.dataset.section === nom));

  const conf = SECTIONS[nom];
  const panneau = $('#panneau');

  if (conf.objet) {
    panneau.innerHTML = `
      <div class="panneau__tete">
        <div><h1>${esc(conf.titre)}</h1><p>${esc(conf.sousTitre)}</p></div>
      </div>
      <form id="form-site" class="fiche" style="display:block; padding:20px;">
        ${conf.champs.map(c => champHTML(c, D.site[c.cle] ?? '')).join('')}
        <button type="submit" class="bouton bouton--or">Valider ces informations</button>
      </form>`;
    $('#form-site').addEventListener('submit', e => {
      e.preventDefault();
      conf.champs.forEach(c => { D.site[c.cle] = $('#champ-' + c.cle).value.trim(); });
      marquerModifie();
      annoncer('Informations mises à jour — pense à cliquer sur Enregistrer.');
    });
    brancherChampsMedia(conf);
    majCompteurs();
    return;
  }

  const liste = D[nom];
  panneau.innerHTML = `
    <div class="panneau__tete">
      <div><h1>${esc(conf.titre)}</h1><p>${esc(conf.sousTitre)}</p></div>
      <button class="bouton bouton--or" data-ajouter>+ Ajouter ${esc(conf.singulier)}</button>
    </div>
    ${liste.length
      ? liste.map((it, i) => ficheHTML(it, i, conf)).join('')
      : `<div class="vide">
           <p>Aucun contenu pour l'instant.</p>
           <button class="bouton bouton--or" data-ajouter>+ Ajouter ${esc(conf.singulier)}</button>
         </div>`}`;

  majCompteurs();
}

function ficheHTML(item, i, conf) {
  const img = conf.vignette && item[conf.vignette]
    ? `<img class="fiche__vignette" src="${esc(item[conf.vignette])}" alt="" onerror="this.style.visibility='hidden'">`
    : `<span class="fiche__vignette"></span>`;

  const details = [];
  if (item.categorie) details.push(`<span class="etiquette">${esc(item.categorie)}</span>`);
  if (item.artiste) details.push(esc(item.artiste));
  if (item.date) details.push(esc(item.date));
  if (item.lieu) details.push(esc(item.lieu));
  if (item.duree) details.push(esc(item.duree));

  const attente = aCopier.has(item.fichier) || aCopier.has(item.affiche) || aCopier.has(item.image);

  return `
  <article class="fiche" data-index="${i}">
    ${img}
    <div class="fiche__txt">
      <strong>${esc(item.titre || '(sans titre)')}</strong>
      <small>${details.join(' · ')}${attente ? ' <span class="alerte-fichier">· fichier à copier</span>' : ''}</small>
    </div>
    <div class="fiche__actions">
      <button class="bouton-ico" data-monter="${i}" title="Monter" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button class="bouton-ico" data-descendre="${i}" title="Descendre">↓</button>
      <button class="bouton-ico" data-modifier="${i}" title="Modifier">✏️</button>
      <button class="bouton-ico" data-supprimer="${i}" title="Supprimer">🗑️</button>
    </div>
  </article>`;
}

function majCompteurs() {
  document.querySelectorAll('[data-compteur]').forEach(el => {
    el.textContent = (D[el.dataset.compteur] || []).length;
  });
}

/* ------------------------------------------------------------
   Champs de formulaire
   ------------------------------------------------------------ */

function champHTML(c, valeur) {
  const id = 'champ-' + c.cle;
  const aide = c.aide ? `<p class="champ__aide">${esc(c.aide)}</p>` : '';
  const req = c.requis ? ' <span style="color:#B3261E">*</span>' : '';

  if (c.type === 'zone') {
    return `<div class="champ">
      <label for="${id}">${esc(c.label)}${req}</label>
      <textarea id="${id}">${esc(valeur)}</textarea>${aide}</div>`;
  }

  if (c.type === 'date') {
    return `<div class="champ">
      <label for="${id}">${esc(c.label)}${req}</label>
      <input type="date" id="${id}" value="${esc(valeur)}">${aide}</div>`;
  }

  if (c.type === 'choix') {
    const actuelle = valeur || c.options[0];
    return `<div class="champ">
      <label for="${id}">${esc(c.label)}${req}</label>
      <select id="${id}">${c.options.map(o =>
        `<option value="${esc(o)}" ${o === actuelle ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
      ${aide}</div>`;
  }

  if (c.type === 'media') {
    return `<div class="champ">
      <label for="${id}">${esc(c.label)}${req}</label>
      <div class="champ-fichier">
        <input type="text" id="${id}" value="${esc(valeur)}" placeholder="${esc(c.dossier)}/…">
        <input type="file" id="fic-${c.cle}" accept="${esc(c.accept)}">
        <button type="button" class="bouton bouton--ligne" data-parcourir="${c.cle}">Parcourir…</button>
      </div>
      ${aide}
      <div class="apercu-media" id="apercu-${c.cle}" hidden></div>
    </div>`;
  }

  const datalist = c.liste
    ? `<datalist id="liste-${c.cle}">${categoriesConnues(sectionActive)
        .map(v => `<option value="${esc(v)}">`).join('')}</datalist>`
    : '';
  return `<div class="champ">
    <label for="${id}">${esc(c.label)}${req}</label>
    <input type="text" id="${id}" value="${esc(valeur)}" ${c.liste ? `list="liste-${c.cle}"` : ''}>
    ${datalist}${aide}</div>`;
}

/** Active les boutons « Parcourir » des champs média. */
function brancherChampsMedia(conf) {
  conf.champs.filter(c => c.type === 'media').forEach(c => {
    const bouton = document.querySelector(`[data-parcourir="${c.cle}"]`);
    const inputFichier = document.getElementById('fic-' + c.cle);
    const champTexte = document.getElementById('champ-' + c.cle);
    if (!bouton || !inputFichier) return;

    bouton.onclick = () => inputFichier.click();

    inputFichier.onchange = async () => {
      const f = inputFichier.files[0];
      if (!f) return;
      const chemin = `${c.dossier}/${nettoyerNom(f.name)}`;
      champTexte.value = chemin;

      const apercu = document.getElementById('apercu-' + c.cle);
      apercu.hidden = false;

      const poids = (f.size / 1048576).toFixed(1);

      if (serveurActif) {
        apercu.textContent = `Transfert de ${f.name} (${poids} Mo)…`;
        bouton.disabled = true;
        try {
          await envoyerMedia(f, c.dossier, nettoyerNom(f.name));
          apercu.innerHTML = `✓ <strong>${esc(f.name)}</strong> copié dans ${esc(c.dossier)} (${poids} Mo)`;
        } catch (e) {
          apercu.innerHTML = `<span class="alerte-fichier">Transfert impossible : ${esc(e.message)}</span>`;
          champTexte.value = '';
        } finally {
          bouton.disabled = false;
        }

      } else if (modeGitHub) {
        // GitHub refuse les gros fichiers : mieux vaut prévenir que planter.
        if (f.size > 24 * 1048576) {
          apercu.innerHTML = `<span class="alerte-fichier">Fichier trop lourd (${poids} Mo).
            Au-delà de 24 Mo, héberge-le ailleurs et colle son lien dans le champ ci-dessus.</span>`;
          champTexte.value = '';
          return;
        }
        apercu.textContent = `Envoi de ${f.name} (${poids} Mo)… cela peut prendre du temps en 4G.`;
        bouton.disabled = true;
        try {
          const b64 = await fichierEnBase64(f);
          await ecrireSurGitHub(chemin, b64, 'Ajout du media ' + nettoyerNom(f.name));
          apercu.innerHTML = `✓ <strong>${esc(f.name)}</strong> envoyé (${poids} Mo)`;
        } catch (e) {
          apercu.innerHTML = `<span class="alerte-fichier">Envoi impossible : ${esc(e.message)}</span>`;
          champTexte.value = '';
        } finally {
          bouton.disabled = false;
        }

      } else {
        aCopier.set(chemin, f.name);
        apercu.innerHTML = `⚠️ Copie toi-même <strong>${esc(f.name)}</strong> dans le dossier
          <strong>${esc(c.dossier)}</strong> — sinon le contenu ne se lira pas.`;
      }
    };
  });
}

/* ------------------------------------------------------------
   Fenêtre d'ajout / modification
   ------------------------------------------------------------ */

let indexEdite = null;

function ouvrirFormulaire(index = null) {
  const conf = SECTIONS[sectionActive];
  indexEdite = index;
  const item = index === null ? {} : D[sectionActive][index];

  $('#fenetre-titre').textContent = index === null
    ? `Ajouter ${conf.singulier}`
    : `Modifier « ${item.titre || 'sans titre'} »`;

  $('#fenetre-champs').innerHTML = conf.champs.map(c => champHTML(c, item[c.cle] ?? '')).join('');
  brancherChampsMedia(conf);
  $('#fenetre').hidden = false;
  setTimeout(() => $('#fenetre-champs input')?.focus(), 60);
}

function fermerFormulaire() {
  $('#fenetre').hidden = true;
  indexEdite = null;
}

$('#formulaire').addEventListener('submit', e => {
  e.preventDefault();
  const conf = SECTIONS[sectionActive];
  const item = {};
  let manquant = null;

  for (const c of conf.champs) {
    const v = document.getElementById('champ-' + c.cle).value.trim();
    if (c.requis && !v) { manquant = c.label; break; }
    if (v) item[c.cle] = v;
  }

  if (manquant) { annoncer(`Le champ « ${manquant} » est obligatoire.`, 'erreur'); return; }

  if (indexEdite === null) D[sectionActive].unshift(item);
  else D[sectionActive][indexEdite] = item;

  marquerModifie();
  fermerFormulaire();
  afficherSection(sectionActive);
  annoncer('Ajouté à la liste — clique sur 💾 Enregistrer pour rendre le changement définitif.');
});

$('#fenetre').addEventListener('click', e => {
  if (e.target.closest('[data-fermer]')) fermerFormulaire();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#fenetre').hidden) fermerFormulaire();
});

/* ------------------------------------------------------------
   Actions sur les listes
   ------------------------------------------------------------ */

$('#panneau').addEventListener('click', e => {
  const liste = D[sectionActive];

  if (e.target.closest('[data-ajouter]')) return ouvrirFormulaire(null);

  const mod = e.target.closest('[data-modifier]');
  if (mod) return ouvrirFormulaire(Number(mod.dataset.modifier));

  const sup = e.target.closest('[data-supprimer]');
  if (sup) {
    const i = Number(sup.dataset.supprimer);
    if (confirm(`Supprimer « ${liste[i].titre || 'cet élément'} » ?\n\nCette action est définitive une fois enregistrée.`)) {
      liste.splice(i, 1);
      marquerModifie();
      afficherSection(sectionActive);
      annoncer('Supprimé — pense à enregistrer.');
    }
    return;
  }

  const haut = e.target.closest('[data-monter]');
  if (haut) {
    const i = Number(haut.dataset.monter);
    if (i > 0) { [liste[i - 1], liste[i]] = [liste[i], liste[i - 1]]; marquerModifie(); afficherSection(sectionActive); }
    return;
  }

  const bas = e.target.closest('[data-descendre]');
  if (bas) {
    const i = Number(bas.dataset.descendre);
    if (i < liste.length - 1) { [liste[i + 1], liste[i]] = [liste[i], liste[i + 1]]; marquerModifie(); afficherSection(sectionActive); }
  }
});

/* ------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------ */

document.querySelectorAll('.menu__item').forEach(b =>
  b.addEventListener('click', () => afficherSection(b.dataset.section)));

$('#btn-enregistrer').addEventListener('click', enregistrer);
$('#btn-publier').addEventListener('click', publier);

(async function demarrer() {
  /* Reprise d'un brouillon non enregistré.
     Un brouillon oublié depuis des heures représente un état périmé :
     le reprendre effacerait silencieusement tout ce qui a été fait depuis.
     On l'écarte donc au-delà de deux heures, et on demande confirmation
     en nommant explicitement le risque. */
  try {
    const brut = localStorage.getItem('touba-brouillon');
    if (brut) {
      const b = JSON.parse(brut);
      const age = Date.now() - (b.quand || 0);
      const perime = !b.quand || age > 2 * 3600 * 1000;
      const different = JSON.stringify(b.donnees) !== JSON.stringify(fusionner(window.CONTENU));

      if (perime || !different) {
        localStorage.removeItem('touba-brouillon');
      } else {
        const minutes = Math.round(age / 60000);
        if (confirm(
            `Des modifications non enregistrées datant d'il y a ${minutes} minute(s) ont été retrouvées.\n\n` +
            "Les reprendre REMPLACERA le contenu actuel de l'application.\n\n" +
            "Reprendre ces modifications ?")) {
          D = fusionner(b.donnees);
          modifie = true;
        } else {
          localStorage.removeItem('touba-brouillon');
        }
      }
    }
  } catch { try { localStorage.removeItem('touba-brouillon'); } catch {} }

  serveurActif = await testerServeur();

  // Pas de serveur local et page servie par internet : on passe par GitHub.
  if (!serveurActif && location.protocol.startsWith('http')) {
    if (!(await verifierJeton())) { demanderJeton(); return; }
    modeGitHub = true;
  }

  majEtatServeur();
  afficherSection('site');

  // En ligne, la publication est automatique : le bouton n'a plus lieu d'être.
  if (modeGitHub) {
    $('#btn-publier').hidden = true;

    const pied = document.querySelector('.menu__pied');
    if (pied) {
      const j = jeton();
      const type = j.startsWith('ghp_') ? 'classique'
                 : j.startsWith('github_pat_') ? 'fine-grained'
                 : 'inconnu';

      pied.innerHTML = `
        <p class="aide-mini"><strong>Mode en ligne.</strong> Remplis, clique sur
        <strong>Valider</strong>, puis sur <strong>💾 Enregistrer</strong>.
        Le site public se met à jour tout seul en une minute environ.</p>
        <p class="aide-mini">Clé <strong>${esc(type)}</strong> (…${esc(j.slice(-4))})
           — compte <strong>${esc(compteDeLaCle || '?')}</strong></p>
        <button id="btn-tester" class="bouton bouton--ligne bouton--bloc"
                style="margin-top:10px">Tester ma clé</button>
        <button id="btn-deconnecter" class="bouton bouton--ligne bouton--bloc"
                style="margin-top:6px">Changer de clé</button>`;

      $('#btn-deconnecter').onclick = () => {
        if (confirm("Oublier la clé enregistrée sur cet appareil ?")) {
          definirJeton('');
          location.reload();
        }
      };

      // Écriture réelle puis nettoyage : le seul moyen fiable de savoir
      // si la clé a vraiment le droit d'écrire.
      $('#btn-tester').onclick = async () => {
        const b = $('#btn-tester');
        b.disabled = true; b.textContent = 'Essai en cours…';
        try {
          const r = await ecrireSurGitHub('.essai-cle.txt',
            enBase64('essai ' + new Date().toISOString()), 'Essai de la cle');
          try {
            await apiGitHub('/contents/.essai-cle.txt', {
              method: 'DELETE',
              body: JSON.stringify({ message: 'Nettoyage essai', sha: r.content.sha, branch: GH.branche })
            });
          } catch {}
          alert("✓ Ta clé fonctionne : l'écriture a réussi.\n\n" +
                "Si l'enregistrement échoue quand même, préviens-moi : " +
                "le problème serait ailleurs.");
        } catch (e) {
          alert("✗ Ta clé ne peut pas écrire.\n\n" + e.message +
                "\n\nUtilise « Changer de clé » et colle une clé classique " +
                "(elle commence par ghp_), créée avec la case « repo » cochée.");
        } finally {
          b.disabled = false; b.textContent = 'Tester ma clé';
        }
      };
    }

    annoncer("Connecté. Tes modifications mettront le site public à jour toutes seules.");
    return;
  }

  // Sans compte Netlify autorisé, la publication en un clic est impossible.
  const bp = $('#btn-publier');
  if (serveurActif && !publicationPossible) {
    bp.textContent = '🌍 Activer la publication';
    bp.onclick = () => alert(
      "Pour publier en un clic, il faut autoriser Netlify une seule fois.\n\n" +
      "1. Ferme cette fenêtre\n" +
      "2. Dans le dossier de l'app, double-clique sur CONNEXION-NETLIFY.bat\n" +
      "3. Autorise dans le navigateur qui s'ouvre\n" +
      "4. Relance GESTION.bat\n\n" +
      "Tu n'auras plus jamais à le refaire.");
  }
  bp.hidden = !serveurActif;

  if (!serveurActif) {
    annoncer("Interface ouverte sans le serveur : l'enregistrement se fera par téléchargement. " +
             "Ferme cette page et lance GESTION.bat pour enregistrer directement.", 'erreur');
  }

  if (!window.CONTENU) {
    annoncer("Le fichier data/contenu.js n'a pas pu être lu — on repart d'un contenu vide.", 'erreur');
  }
})();
