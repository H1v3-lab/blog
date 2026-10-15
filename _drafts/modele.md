---
title: "Titre de l'article"
description: "Une phrase qui résume l'article (page d'accueil, aperçus de partage, recherche)."
tags: [ctf, web]
# series: "Nom de la série"      # optionnel : regroupe plusieurs articles (bannière + page d'accueil)
# hidden: true                   # optionnel : garde l'article accessible par URL mais hors de la liste
# toc: false                     # optionnel : masque le sommaire automatique
# image: /assets/img/apercu.png  # optionnel : image d'aperçu réseaux sociaux
---

Introduction : le contexte en deux ou trois phrases.

<!--more-->

## Première partie

Texte. Les titres `##` et `###` construisent automatiquement le sommaire.

```python
from pwn import *
r = remote("cible", 1337)
```

> Une remarque ou une citation.

## Conclusion

Ce qu'il faut retenir.
