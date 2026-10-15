# Guide : publier sur le blog

Tout se fait sur **github.com** (ordinateur ou téléphone), sans rien installer.
Le site se met à jour tout seul environ 1 minute après chaque `Commit changes`.

## 1. Publier un article en français

1. `github.com/H1v3-lab/blog` → dossier **`_posts`** → **Add file → Create new file**.
2. Nom du fichier : `AAAA-MM-JJ-titre-court.md` (ex. `2026-11-02-mon-sujet.md`).
   La date et le titre forment l'adresse de l'article.
3. Colle ce modèle et remplis-le :

   ```markdown
   ---
   lang: fr
   ref: mon-sujet
   title: "Le titre de mon article"
   description: "Une phrase qui résume l'article."
   tags: [web, ctf]
   ---

   Introduction en deux-trois phrases.

   <!--more-->

   ## Première partie

   Mon texte en Markdown.
   ```

4. **Commit changes**.

> `ref:` est une étiquette que tu choisis. Elle relie la version FR et la version EN : mets la **même** dans les deux.

## 2. La version anglaise

Même méthode, dans **`_posts`** aussi :

```markdown
---
lang: en
ref: mon-sujet
permalink: /en/2026/11/my-topic/
title: "My article title"
description: "One sentence summarising the article."
tags: [web, ctf]
---

Intro in two or three sentences.

<!--more-->

## First part

My text in English.
```

Le bouton **FR / EN** apparaît automatiquement dans les deux articles grâce au `ref:` commun.

## 3. Options de l'en-tête

| Clé | Effet |
| --- | --- |
| `tags: [til, ...]` | note courte : apparaît aussi sur la page **/til/** avec un badge |
| `series: "Nom"` | regroupe des épisodes : bannière dans l'article + carte en accueil |
| `hidden: true` | accessible par URL, mais hors liste, RSS et recherche |
| `toc: false` | masque le sommaire automatique |
| `image: /assets/img/x.png` | image d'aperçu pour les réseaux sociaux |

## 4. Images

Dépose-les dans **`assets/img/`** (Add file → Upload files), puis dans l'article :

```markdown
![description de l'image](/assets/img/mon-image.png)
```

## 5. Brouillon

Un fichier placé dans **`_drafts/`** (au lieu de `_posts/`) n'est jamais publié.

## 6. Mémo Markdown

```markdown
## Titre de section        (## et ### construisent le sommaire)
**gras**  *italique*  [un lien](https://exemple.com)
- liste à puces
`code court`
> une citation
```

Bloc de code avec coloration :

    ```python
    print("bonjour")
    ```

## 7. Aperçu en local (optionnel, pour les développeurs)

```
bundle install
bundle exec jekyll serve
```
