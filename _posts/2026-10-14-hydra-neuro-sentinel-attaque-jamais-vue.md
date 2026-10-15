---
lang: fr
ref: hydra-1
title: "Les coulisses de Hydra, épisode 1 : détecter une attaque jamais vue"
description: "Comment Neuro-Sentinel, le cœur défensif de Hydra, repère une intrusion sans jamais avoir vu sa signature — en apprenant d'abord à quoi ressemble un réseau sain."
series: "Les coulisses de Hydra"
tags: [hydra, défense, ia, détection, réseau]
---

La plupart des outils de détection fonctionnent comme un videur avec une liste de têtes connues : si ton visage est sur la liste, tu n'entres pas. C'est efficace contre les menaces déjà répertoriées, et totalement aveugle face à une attaque jamais vue. Or une attaque jamais vue, c'est exactement ce qu'un attaquant sérieux s'arrange pour être.

<!--more-->

Dans [Hydra](https://sakoi-cyber.me/hydra.html), notre plateforme de cyberdéfense autonome, c'est le module **Neuro-Sentinel** qui porte cette question : comment repérer une intrusion dont on n'a aucune signature ? Ce premier épisode raconte l'idée centrale, et ce qu'elle donne en laboratoire.

## Le problème des signatures

Un IDS classique compare le trafic à une base de signatures connues. Il faut donc que quelqu'un, quelque part, ait déjà vu l'attaque, l'ait analysée et ait publié sa signature. Entre le moment où une technique apparaît et celui où sa signature est diffusée, il y a une fenêtre — parfois des mois — pendant laquelle l'attaque est invisible.

Pour un pays ou une institution qui n'a pas de SOC ouvert en continu, cette fenêtre est fatale. Nous avons donc pris le problème à l'envers : au lieu d'apprendre à reconnaître le mal, apprendre à reconnaître le **bien**, puis réagir à tout ce qui s'en écarte.

## L'inspiration : le système immunitaire

Ton système immunitaire ne possède pas de catalogue de tous les virus existants. Il apprend très tôt ce qu'est le « soi » — tes propres cellules — et déclenche une réponse contre tout ce qui ne l'est pas. Un virus inédit n'a pas besoin d'être connu pour être attaqué : il suffit qu'il soit *différent du soi*.

Neuro-Sentinel applique cette logique au réseau :

1. **Phase d'apprentissage.** Au démarrage, le module observe le trafic et construit un modèle de ce qu'est une activité normale sur cette infrastructure précise.
2. **Phase de détection.** Ensuite, chaque flux reçoit un **score d'anomalie** : à quel point s'écarte-t-il du normal appris ?

Un flux très banal passe inaperçu. Un flux inhabituel — un scan, une exfiltration, un protocole inattendu sur un port inattendu — remonte, même si personne n'a jamais publié de signature pour lui.

## Sous le capot

L'algorithme qui porte l'analogie immunitaire s'appelle la **sélection négative** (NSA, *Negative Selection Algorithm*), issu des systèmes immunitaires artificiels. Comme les lymphocytes, on entraîne des « détecteurs » à ne surtout pas réagir au soi ; tout ce qui les active est, par construction, étranger.

La sélection négative seule souffre dans les espaces à grande dimension — et un flux réseau, c'est beaucoup de dimensions. Nous la combinons donc à deux détecteurs d'anomalie éprouvés, via la bibliothèque PyOD :

- un **Isolation Forest**, qui isole les points rares en les « coupant » plus vite que les points denses ;
- un **One-Class SVM**, qui trace une frontière autour de la zone du normal.

Trois regards différents sur la même question « est-ce normal ? », dont on agrège les avis. Ça réduit les faux positifs d'un détecteur pris isolément.

## Décider, puis riposter sans tout casser

Détecter ne suffit pas : il faut réagir, et réagir proportionnellement. Un agent d'apprentissage par renforcement (PPO, via stable-baselines3) choisit la riposte, encadré par des garde-fous liés au score d'anomalie et au volume de paquets — pour qu'un agent mal entraîné ne reste pas bloqué sur une seule action.

La réponse est **graduée**, comme une réaction immunitaire :

| Niveau | Réponse | Effet |
| --- | --- | --- |
| 0 | Journalisation | On enregistre et on surveille |
| 1 | Quarantaine | Le conteneur suspect est isolé du réseau |
| 2 | Bannissement | L'IP source est bloquée, avec expiration |
| 3 | Redirection | Le trafic est dévié vers un honeypot |

On ne sort pas l'artillerie pour un éternuement, mais on peut monter en puissance si l'anomalie persiste.

## Ce que ça donne en laboratoire

Notre banc d'essai simule une petite infrastructure sous Docker, avec une DMZ et un réseau interne séparés. Résultat marquant : lors d'un scan `nmap` lancé depuis le conteneur attaquant, Neuro-Sentinel l'a détecté puis mis la cible en quarantaine, la rendant injoignable — **sans signature de `nmap`**, uniquement parce que ce trafic ne ressemblait pas au normal appris.

Sur un test plus large de **2 509 611 flux analysés**, le module a levé **3 alertes** et procédé à **3 mises en quarantaine**. Peu d'alertes, donc, mais pertinentes : c'est exactement ce qu'on vise — un défenseur noyé sous les faux positifs finit par tout ignorer.

## Ce qui reste à faire

L'approche a ses limites, que nous assumons :

- la phase d'apprentissage suppose un trafic initial *sain* ; si l'attaquant est déjà là pendant l'apprentissage, il devient le « soi » ;
- un attaquant lent et discret, qui imite le trafic normal, reste le cas difficile ;
- il faut encore éprouver le modèle face à des attaques **polymorphes**, qui changent de forme pour échapper à la détection.

C'est le chantier de la suite. Dans le prochain épisode, je raconterai **Aegis**, la tête offensive de Hydra : l'attaquant autonome qui sert à la fois à auditer l'infrastructure et à générer le trafic qui entraîne Neuro-Sentinel. Car on ne défend bien que ce qu'on a déjà attaqué soi-même.

*Hydra est notre projet de fin d'études, présenté aux JPOPE 2026. Le dossier complet est [sur le portfolio](https://sakoi-cyber.me/hydra.html).*
