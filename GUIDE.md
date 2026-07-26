# Touba Média — Guide d'utilisation

Application de la communauté mouride : **vidéos**, **musiques/khassaïdes**, **événements** et **actualités**.
Installable sur téléphone comme une vraie application (PWA), fonctionne aussi hors connexion.

---

## 1. Ouvrir l'application sur ton ordinateur

**Double-clique simplement sur `index.html`.** L'application s'ouvre dans ton navigateur.
C'est tout — aucun serveur, aucune installation.

*(Optionnel)* Si tu veux tester le mode hors connexion et le bouton « Installer », il faut
un vrai serveur : double-clique alors sur **`demarrer.bat`**, qui ouvre l'app sur
`http://localhost:8080`. Laisse la fenêtre noire ouverte pendant l'utilisation.

---

## 2. Ajouter ton contenu — l'espace de gestion

**Double-clique sur `GESTION.bat`.** Une interface s'ouvre avec des formulaires :
tu n'as aucun code à écrire.

### La première fois : connecte le dossier

Clique sur **« 🔗 Connecter le dossier »**, puis choisis le dossier **`touba-media`**
et autorise la modification.

Une fois connecté (pastille dorée **« ✓ Dossier connecté »**), tout devient automatique :
- le bouton **💾 Enregistrer** écrit directement dans l'app ;
- tes fichiers vidéo et audio sont **copiés tout seuls** au bon endroit.

> Cette connexion fonctionne sur **Chrome** et **Edge**. Sur un autre navigateur, le bouton
> Enregistrer téléchargera un fichier `contenu.js` que tu devras replacer toi-même dans `data/`,
> et tu devras copier tes fichiers média à la main.

### Ajouter une vidéo ou une musique

1. Clique sur **Vidéos** (ou **Musiques**) dans le menu de gauche.
2. Clique sur **« + Ajouter une vidéo »**.
3. Remplis le titre, la catégorie, la date…
4. Sur la ligne *Fichier vidéo*, clique sur **« Parcourir… »** et choisis ton fichier MP4.
5. Clique sur **Valider**, puis sur **💾 Enregistrer** en haut à droite.
6. Rafraîchis l'application (`F5`) : ton contenu est là.

Les flèches **↑ ↓** changent l'ordre d'affichage, le crayon **✏️** modifie, la corbeille **🗑️** supprime.

> ⚠️ Les changements ne sont définitifs qu'après avoir cliqué sur **💾 Enregistrer**.
> Si tu fermes la page avant, le navigateur te prévient.

### Astuce : les vidéos lourdes

Au lieu de choisir un fichier, tu peux **coller un lien YouTube** dans le champ *Fichier vidéo*.
La vidéo se lira dans l'app sans occuper d'espace — pratique si tu en as beaucoup.

---

## 2 bis. Modifier le contenu à la main (facultatif)

Si tu préfères, tout le contenu tient dans **un seul fichier** : `data/contenu.js`,
que tu peux ouvrir avec le **Bloc-notes**. L'interface reste plus sûre.

### Règles à respecter

- Ne touche **pas** à la première ligne `window.CONTENU = {` ni à la dernière `};`.
- Garde les guillemets `"` autour des textes.
- Mets une **virgule** entre chaque bloc `{ ... }`, mais **pas après le dernier**.
- Les dates s'écrivent toujours **`"AAAA-MM-JJ"`** — par exemple `"2026-08-14"`.
- Après modification, **enregistre** puis **rafraîchis** la page (touche `F5`).

> Si la page affiche « Contenu introuvable », c'est presque toujours une **virgule en trop**
> ou un **guillemet manquant** dans ce fichier. Compare avec les exemples ci-dessous.

### Ajouter une vidéo

Copie tes fichiers dans `medias/videos/`, puis ajoute dans la section `"videos"` :

```json
{
  "titre": "Khassaïda du vendredi",
  "description": "Récitation enregistrée à la dahira.",
  "categorie": "Khassaïda",
  "date": "2026-07-18",
  "duree": "15:42",
  "fichier": "medias/videos/mon-fichier.mp4",
  "affiche": "medias/images/ma-photo.jpg"
}
```

- `categorie` crée automatiquement un **bouton de filtre** en haut de la page Vidéos.
  Utilise les mêmes mots pour regrouper (`Khassaïda`, `Conférence`, `Événement`…).
- `affiche` est l'image de couverture. Facultative — laisse `""` si tu n'en as pas.
- `duree` est juste un texte affiché sur la vignette.

**Astuce :** tu peux aussi mettre un **lien YouTube** dans `fichier`
(`"fichier": "https://www.youtube.com/watch?v=XXXXXXXXXXX"`) — la vidéo se lira dans l'app
sans occuper d'espace de stockage.

### Ajouter une musique / un khassaïd

Copie tes fichiers `.mp3` dans `medias/audios/`, puis dans la section `"audios"` :

```json
{
  "titre": "Jazbou",
  "artiste": "Kurel de la dahira",
  "categorie": "Khassaïda",
  "duree": "12:30",
  "fichier": "medias/audios/jazbou.mp3",
  "affiche": "medias/images/pochette.jpg"
}
```

Le lecteur audio reste **en bas de l'écran** : on peut continuer à naviguer dans l'app
pendant l'écoute, et la piste suivante s'enchaîne automatiquement.

### Ajouter un événement

```json
{
  "titre": "Grand Magal de Touba",
  "date": "2026-08-01",
  "heure": "Toute la journée",
  "lieu": "Touba, Sénégal",
  "description": "Rassemblement annuel de la communauté."
}
```

L'app sépare toute seule les événements **à venir** et **passés**, et affiche
un compte à rebours (« Dans 12 jours »).

### Ajouter une actualité

```json
{
  "titre": "Nouvelle annonce",
  "date": "2026-07-25",
  "auteur": "Commission média",
  "resume": "Une phrase courte visible directement.",
  "contenu": "Le texte long, caché derrière « Lire la suite ».\n\nUtilise \\n\\n pour aller à la ligne.",
  "image": "medias/images/photo.jpg"
}
```

### Changer le nom de l'application

Dans la section `"site"` en haut du fichier : `nom`, `slogan`, `titreAccueil`, `texteAccueil`.

---

## 3. Formats de fichiers recommandés

| Type   | Format    | Conseil                                                       |
|--------|-----------|---------------------------------------------------------------|
| Vidéo  | **MP4** (H.264) | Le seul format lu partout. Vise moins de 100 Mo par vidéo. |
| Audio  | **MP3**   | Compatible avec tous les téléphones.                          |
| Images | **JPG**   | Couverture en 1280×720 px, poids < 300 Ko.                    |

> Les fichiers `.mkv`, `.avi`, `.wmv`, `.flac` **ne se lisent pas** dans un navigateur.
> Convertis-les en MP4/MP3 (VLC ou HandBrake le font gratuitement).

---

## 4. Mettre l'application en ligne (gratuit)

Pour que la communauté y accède depuis n'importe quel téléphone :

1. Crée un compte gratuit sur **[netlify.com](https://netlify.com)**.
2. Va sur **[app.netlify.com/drop](https://app.netlify.com/drop)**.
3. **Glisse-dépose le dossier `touba-media` entier** dans la page.
4. Tu obtiens un lien du type `https://touba-media.netlify.app` — partage-le.

Autres options équivalentes : Vercel, Cloudflare Pages, GitHub Pages.

> **Attention au poids.** L'hébergement gratuit convient pour une centaine de fichiers.
> Si tu as beaucoup de vidéos lourdes, mets-les sur YouTube (en « non répertorié » si tu veux
> qu'elles restent privées) et colle le lien dans `fichier` — c'est gratuit et illimité.

---

## 5. Installer l'app sur le téléphone

Une fois le site en ligne (étape 4), ouvre le lien sur le téléphone :

- **Android (Chrome)** : appuie sur le bouton doré **« Installer »**, ou menu ⋮ → *Ajouter à l'écran d'accueil*.
- **iPhone (Safari)** : bouton *Partager* ⬆️ → *Sur l'écran d'accueil*.

L'icône apparaît sur l'écran d'accueil et l'app s'ouvre en plein écran, sans barre de navigateur.

---

## 6. Fonctions déjà incluses

- 5 pages : Accueil, Vidéos, Musiques, Événements, Actualités
- Lecteur audio persistant (continue pendant la navigation, enchaîne les pistes)
- Lecteur vidéo en plein écran
- Filtres par catégorie, générés automatiquement
- Recherche globale (loupe en haut à droite)
- Thème clair / sombre
- Fonctionne hors connexion pour les pages déjà visitées
- Adapté au téléphone comme à l'ordinateur

---

## 7. Après une modification du code

Si tu modifies un fichier autre que `contenu.js` (par ex. le style ou le code),
ouvre `sw.js` et change la ligne :

```js
const VERSION = 'touba-media-v4';   →   'touba-media-v5'
```

Sinon les utilisateurs garderont l'ancienne version en mémoire.

*(Le contenu de `contenu.js`, lui, se met à jour tout seul — pas besoin de toucher à `sw.js`.)*

---

## 8. Structure du projet

```
touba-media/
├── index.html              ← DOUBLE-CLIQUE ICI pour ouvrir l'app
├── GESTION.bat             ← ★ DOUBLE-CLIQUE ICI pour ajouter du contenu ★
├── admin.html              ← l'espace de gestion (ouvert par GESTION.bat)
├── demarrer.bat            ← (optionnel) lance un serveur local
├── manifest.webmanifest    ← infos d'installation (nom, icône)
├── sw.js                   ← mode hors connexion
├── GUIDE.md                ← ce fichier
├── data/
│   └── contenu.js          ← ★ LE SEUL FICHIER À MODIFIER ★
├── medias/
│   ├── videos/             ← tes fichiers .mp4
│   ├── audios/             ← tes fichiers .mp3
│   └── images/             ← tes photos de couverture
└── assets/                 ← code et icônes (ne pas toucher)
```
