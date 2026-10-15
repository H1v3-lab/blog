---
title: "TIL : une adresse IP peut s'écrire en un seul nombre"
description: "23.94.145.93 et 392073565 pointent vers la même machine. Les malwares s'en servent pour échapper aux filtres d'URL."
tags: [til, réseau, malware]
toc: false
---

En analysant une chaîne d'infection, je suis tombé sur une URL du genre `hxxp://392073565/33829`. Ce gros nombre **est** une adresse IP : la forme décimale de `23.94.145[.]93`.

<!--more-->

Une IPv4, c'est quatre octets. On les écrit d'habitude en « pointé-décimal » (`a.b.c.d`), mais ce n'est qu'une convention d'affichage. On peut tout aussi bien lire les quatre octets comme **un seul entier 32 bits** :

```
23.94.145.93
= 23*256³ + 94*256² + 145*256 + 93
= 392073565
```

La plupart des navigateurs et des bibliothèques réseau acceptent cette forme et la résolvent vers la même machine. Les malwares l'utilisent pour une raison simple : un filtre d'URL ou un outil de réputation qui cherche des motifs `a.b.c.d` **ne voit pas** `392073565` comme une adresse IP, et laisse passer.

Il existe aussi des variantes en octal et en hexadécimal. La leçon défensive : quand tu écris une règle de détection réseau, ne suppose pas que les IP sont toujours en pointé-décimal.
