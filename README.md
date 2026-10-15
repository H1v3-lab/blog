# Blog — blog.sakoi-cyber.me

Blog de Dmod (Dominique-Savio SAKOI). Site statique généré par **Jekyll**, publié automatiquement par **GitHub Pages** à chaque modification de la branche `main`.

## Publier un article (depuis github.com, même sur téléphone)

1. Ouvre le dossier [`_posts`](_posts) → **Add file → Create new file**.
2. Nomme le fichier `AAAA-MM-JJ-titre-de-l-article.md` (ex. `2026-11-02-writeup-jwt-confusion.md`).
   La date et le titre du nom de fichier donnent l'adresse : `blog.sakoi-cyber.me/2026/11/writeup-jwt-confusion/`.
3. Colle le contenu de [`_drafts/modele.md`](_drafts/modele.md), remplis l'en-tête (`title`, `description`, `tags`) et écris en Markdown.
4. **Commit changes** : l'article est en ligne environ une minute plus tard.

Brouillons : un fichier dans `_drafts/` n'est jamais publié.
Images : dépose-les dans `assets/img/` et insère-les avec `![description](/assets/img/fichier.png)`.

### Options de l'en-tête

- `series: "Nom"` — regroupe plusieurs articles ; une bannière de navigation apparaît dans chaque article de la série, et une carte sur la page d'accueil.
- `tags: [til, ...]` — un article avec le tag `til` apparaît aussi sur la page **/til/** (notes courtes).
- `hidden: true` — l'article reste accessible par son URL mais n'apparaît ni dans la liste, ni dans la recherche, ni dans le RSS.
- `toc: false` — masque le sommaire automatique.

## Ce que le blog fait tout seul

- page d'accueil avec **recherche instantanée**, filtre par tag, page `/tags/`, page `/til/`, **séries** d'articles ;
- temps de lecture, sommaire automatique (≥ 3 titres), bouton « copier » sur les blocs de code, coloration syntaxique ;
- flux RSS (`/feed.xml`), plan du site (`/sitemap.xml`), index de recherche (`/search.json`) et balises de partage ;
- articles précédent / suivant, lien vers le portfolio, **polices auto-hébergées** (aucune requête tierce).

## Newsletter et statistiques (optionnels, sans pistage)

Dans `_config.yml`, deux réglages commentés :

- `buttondown: "ton-identifiant"` — active le formulaire d'abonnement par e-mail via [Buttondown](https://buttondown.com). Tant qu'il est vide, le site n'affiche que l'abonnement RSS.
- `cf_analytics_token: "…"` — colle le jeton de **Cloudflare Web Analytics** (Cloudflare → Analytics → Web Analytics) pour des statistiques **sans cookie**. Tant qu'il est vide, aucun script de mesure n'est chargé.

## Domaine

Le fichier `CNAME` contient `blog.sakoi-cyber.me`. Chez Namecheap (Domain List → sakoi-cyber.me → Manage → Advanced DNS), un enregistrement **CNAME** `blog` → `h1v3-lab.github.io.`

## Aperçu en local (optionnel)

```
bundle install
bundle exec jekyll serve
```
