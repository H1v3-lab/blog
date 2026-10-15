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

## Ce que le blog fait tout seul

- page d'accueil avec filtre par tag, page `/tags/`, temps de lecture, sommaire automatique (≥ 3 titres), bouton « copier » sur les blocs de code, coloration syntaxique ;
- flux RSS (`/feed.xml`), plan du site (`/sitemap.xml`) et balises de partage (titre, description) ;
- articles précédent / suivant, lien vers le portfolio.

## Domaine

Le fichier `CNAME` contient `blog.sakoi-cyber.me`. Chez Namecheap (Domain List → sakoi-cyber.me → Manage → Advanced DNS), un enregistrement **CNAME** `blog` → `h1v3-lab.github.io.`

## Aperçu en local (optionnel)

```
bundle install
bundle exec jekyll serve
```
