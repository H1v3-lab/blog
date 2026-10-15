---
title: "Ma stack vie privée, outil par outil"
description: "Les outils que j'utilise au quotidien pour réduire ce que j'expose, chiffrer ce que je garde, et ne jamais confier à un service plus que nécessaire — avec le pourquoi de chaque choix."
tags: [vie privée, chiffrement, outils]
---

La vie privée n'est pas une case à cocher, c'est une suite de petites décisions prises tous les jours. Je ne prétends pas être invisible — personne ne l'est — mais je cherche à **réduire ma surface d'exposition** et à garder le contrôle de mes données. Voici ma boîte à outils, et surtout le raisonnement derrière.

<!--more-->

Un principe d'abord : le modèle de menace. On ne se protège pas de la même façon contre un annonceur qui veut te pister, un voisin curieux ou un adversaire étatique. La plupart de ces outils visent le premier et le deuxième — la surveillance commerciale de masse — qui concernent tout le monde, tous les jours.

## Le courrier : Proton Mail

Le mail est le trousseau de clés de ta vie numérique : qui contrôle ta boîte peut réinitialiser presque tous tes autres comptes. Je suis chez **Proton Mail** pour deux raisons : le chiffrement de bout en bout entre utilisateurs Proton, et surtout un modèle économique où **je suis le client, pas le produit**. Gmail est gratuit parce que ton courrier nourrit le ciblage publicitaire ; Proton est payant parce que tu payes pour un service, point.

Détail qui compte : j'utilise une adresse à mon propre domaine qui **redirige** vers Proton. Mon adresse personnelle n'apparaît nulle part publiquement ; si une adresse de contact fuite ou croule sous le spam, je la change sans toucher à ma vraie boîte.

## Les mots de passe et les alias : Proton Pass

Un mot de passe unique par service, long et aléatoire, stocké dans un gestionnaire : c'est le conseil de sécurité qui a le meilleur rapport effort/bénéfice, et de loin. J'utilise **Proton Pass**, mais un bon gestionnaire quel qu'il soit (Bitwarden, KeePassXC) vaut infiniment mieux que des mots de passe réutilisés.

La fonction que je préfère, ce sont les **alias e-mail** : chaque service reçoit une adresse jetable différente. Avantages :
- si un site se fait pirater, l'alias ne mène à rien d'autre ;
- je vois immédiatement **qui a revendu mon adresse** (le spam arrive sur l'alias de ce service précis) ;
- je coupe un alias compromis sans impact sur le reste.

## Le réseau : Proton VPN

Un VPN ne te rend pas anonyme — c'est un malentendu courant. Ce qu'il fait : il empêche ton fournisseur d'accès (ou le Wi-Fi d'un café) de voir *quels* sites tu visites, et il masque ton IP aux sites visités. Je retiens deux critères : une **politique no-log** crédible et auditée, et un modèle économique sain. Un « VPN gratuit » se paie en revendant ton trafic : exactement ce qu'on cherchait à éviter.

## Les navigateurs : Brave et Zen

Le navigateur est l'endroit où se joue l'essentiel du pistage. J'en utilise deux :

- **Brave** pour la navigation courante : blocage des traqueurs et des pubs intégré, sans extension à configurer.
- **Zen**, basé sur Firefox, sans télémétrie, quand je veux un environnement plus sobre et personnalisable.

Le point commun : ne pas dépendre d'un navigateur dont l'éditeur vit de la publicité ciblée. Là encore, la question « qui paie, et comment ? » guide le choix.

## L'anonymat quand il le faut : Tor

Tor n'est pas pour tous les jours — c'est lent, et ce n'est pas le but. Mais quand le besoin est un **vrai anonymat** (consulter une ressource sensible, séparer complètement une activité de mon identité), le navigateur Tor fait passer le trafic par plusieurs relais, de sorte qu'aucun maillon ne connaît à la fois qui tu es et ce que tu consultes.

## Le chiffrement local : GnuPG

Pour signer ou chiffrer des fichiers et des messages, **GnuPG**. Ma clé publique est [publiée sur mon domaine](https://sakoi-cyber.me/pgp.asc) : n'importe qui peut m'envoyer un rapport de faille chiffré que je suis seul à pouvoir lire. La clé privée, elle, ne quitte jamais ma machine et dispose d'une sauvegarde hors ligne.

## Ce que ça change, concrètement

Aucun de ces outils n'est magique, et empilés sans méthode ils donnent un faux sentiment de sécurité. Ce qui compte, c'est la cohérence :

- **réduire** ce que j'expose (alias, adresse de domaine, pas de vrais identifiants publics) ;
- **chiffrer** ce que je garde (mail, mots de passe, fichiers sensibles) ;
- **ne jamais confier** à un service plus que le strict nécessaire, et préférer ceux dont le modèle économique ne repose pas sur mes données.

Et un rappel honnête : le maillon le plus faible, c'est presque toujours l'humain, pas l'outil. Un bon gestionnaire de mots de passe et l'authentification à deux facteurs font plus pour ta sécurité réelle que n'importe quelle configuration exotique. Commence par là.
