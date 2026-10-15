---
title: "Anatomie d'une campagne ClickFix : quand la victime lance elle-même le malware"
description: "Analyse d'une chaîne d'infection réelle où aucune faille n'est exploitée : c'est l'utilisateur qui colle la commande. Du faux CAPTCHA au voleur de clés Chrome, huit étapes conçues pour tromper chaque défense une par une."
tags: [analyse, malware, reverse, défense, clickfix]
---

La faille la plus efficace n'est pas toujours technique. Dans la campagne que j'ai analysée ce mois-ci — que j'appelle « Romulus », du nom de son panneau d'administration — **aucune vulnérabilité n'est exploitée**. La victime copie elle-même une commande et appuie sur Entrée. Tout le reste n'est qu'une succession de couches conçues pour que, à chaque étape, une défense précise ne voie rien.

<!--more-->

> Cet article est une synthèse défensive à but pédagogique. Les indicateurs sont « défangués » (`hxxp`, `[.]`) et la commande malveillante n'est pas reproduite telle quelle. Le serveur de commande n'a jamais été contacté : l'analyse est statique et par émulation hors ligne.

## ClickFix, ou l'art de faire travailler la victime

La plupart des gens ont appris à se méfier des pièces jointes. **ClickFix** contourne ce réflexe en ne téléchargeant rien : la page piégée affiche un faux CAPTCHA ou un faux message d'erreur, et demande à l'utilisateur de « vérifier qu'il est humain » en faisant trois gestes :

1. appuyer sur **Win + R** (la boîte « Exécuter » de Windows) ;
2. coller avec **Ctrl + V** ;
3. valider avec **Entrée**.

Pendant ce temps, un bout de JavaScript a discrètement placé une commande dans le presse-papiers. L'utilisateur croit résoudre un CAPTCHA ; en réalité, il exécute du code avec ses propres droits.

Le point génial — et pervers — c'est que **le navigateur ne télécharge aucun fichier** et que **c'est l'utilisateur qui lance le code**. Les protections du navigateur et une partie des défenses automatiques n'ont rien à inspecter.

**La règle à retenir, pour toi et pour tes proches : aucun CAPTCHA légitime au monde ne te demandera jamais d'ouvrir la boîte « Exécuter » de Windows.** Si une page te le demande, c'est une attaque. Point final.

## Huit étapes, chacune contre une défense

Une fois la commande lancée, huit étapes séparent le collage du malware actif. Ce qui m'a frappé en déroulant la chaîne, c'est qu'elle n'est pas « obscurcie » au hasard : **chaque couche neutralise une défense bien précise.**

| Couche | Technique | Défense visée |
| --- | --- | --- |
| Commande collée | Obfuscation par reconstruction caractère par caractère | Lecture des lignes de commande |
| Téléchargement | Adresse IP écrite en notation **décimale** | Filtres d'URL et de réputation |
| Installation | `msiexec` en mode silencieux, par utilisateur | Invite UAC et processus de confiance |
| Fichier installé | **MSI généré à la volée**, différent à chaque téléchargement | Listes de hashes (signatures) |
| Chargement | Déchiffrement en mémoire, sur plusieurs couches | Antivirus qui scanne le disque |
| Loader | Contrôles **anti-VM et anti-sandbox** | Analyse automatique en bac à sable |
| Payload | Code mappé en mémoire, aucun exécutable sur le disque | Détection par fichier |
| C2 | JSON chiffré (RC4) vers un domaine distinct | Inspection réseau simple |

Prises une à une, aucune de ces techniques n'est révolutionnaire. **Empilées, elles forment une chaîne où chaque maillon aveugle un capteur différent** — et seule une corrélation comportementale voit l'ensemble.

## Le détail qui en dit long : un MSI différent à chaque fois

Un point mérite qu'on s'y arrête, parce qu'il illustre à quel point ces campagnes sont industrialisées. En téléchargeant **trois fois** le même fichier d'installation depuis le serveur de distribution, j'ai obtenu **trois fichiers différents** : tailles différentes, empreintes différentes, noms internes aléatoires, métadonnées aléatoires. Aucun n'était connu des bases publiques.

Autrement dit, le serveur **fabrique un installeur unique juste avant de l'envoyer** (la date de création interne du fichier était deux minutes avant le téléchargement). Conséquence directe : **bloquer par empreinte (hash) ne sert à rien.** Le hash est périmé au téléchargement suivant. C'est tout l'argument en faveur de la détection comportementale.

## Ce que fait le malware une fois installé

Le payload final est un **loader modulaire** : il ne fait pas grand-chose par lui-même, il s'enregistre auprès de son serveur de commande puis exécute les tâches qu'on lui envoie. Traduction : la machine infectée devient une **porte d'entrée louable**. L'attaquant peut y déposer ensuite n'importe quoi — un rançongiciel, un autre voleur, un outil d'accès distant.

Les capacités observées dans le code (sans contacter le serveur) :

- **exécution de tâches à distance** décidées par le serveur ;
- **plusieurs techniques d'injection** dans des processus légitimes (`explorer.exe`, `RuntimeBroker.exe`…), avec falsification du processus parent pour brouiller les pistes ;
- **contournement d'AMSI**, l'interface antimalware de Windows ;
- **persistance** via la base de registre, si une tâche le demande ;
- surtout, **le vol de la clé de chiffrement de Chrome** (App-Bound Encryption).

Ce dernier point est le plus douloureux. Avec cette clé, l'attaquant déchiffre **hors ligne** les cookies et les mots de passe enregistrés dans Chrome. Il peut alors **détourner des sessions déjà authentifiées — y compris celles protégées par double authentification**, puisqu'il réutilise un cookie de session déjà validé. C'est pour ça qu'une machine touchée doit être considérée comme **entièrement compromise** : changer les mots de passe ne suffit pas, il faut invalider les sessions.

## Détecter le comportement, pas le fichier

Puisque les fichiers changent à chaque infection, la détection doit viser les **enchaînements**. Les signaux les plus fiables observés :

- `explorer.exe` → `cmd` avec des options d'expansion différée → `powershell` avec une commande encodée en Base64, avec une entrée fraîche dans l'historique de la boîte « Exécuter » (`RunMRU`) ;
- `msiexec` en mode silencieux sur un fichier du dossier temporaire, suivi d'un `powershell` lancé par `msiexec` sur un script aux chiffres aléatoires ;
- de la **mémoire exécutable privée contenant un exécutable** à l'intérieur de `powershell.exe` ;
- un processus `explorer`, `csc` ou `RuntimeBroker` dont le **parent est incohérent** ;
- la lecture du fichier `Local State` de Chrome par un processus **autre que Chrome**, et un *pipe* nommé aux permissions trop ouvertes.

Côté réseau : un appel à un service de géolocalisation d'IP, suivi de requêtes `POST` encodées en Base64 vers un script `.php`.

## Que faire si une machine est touchée

1. **Isoler** la machine du réseau. Bloquer au proxy et au DNS les indicateurs réseau connus.
2. **Capturer la mémoire avant de redémarrer** : le payload n'existe qu'en RAM, un redémarrage l'efface et détruit les preuves.
3. Depuis un **appareil sain**, déconnecter toutes les sessions, changer les mots de passe et **révoquer les jetons** : les secrets de Chrome sont à considérer comme volés.
4. **Réinstaller le système.** On ne sait pas ce qui a été déposé ensuite ; on ne nettoie pas, on reconstruit.
5. **Prévenir** : sensibiliser les utilisateurs (le fameux « aucun CAPTCHA ne demande Win+R »), interdire l'installation de MSI par les utilisateurs standard, activer AppLocker / WDAC.

## Indicateurs (défangués)

```
# Réseau
23.94.145[.]93 / .88 / .224      distribution + panneau "Romulus" (AS207043)
havelbeenpwned[.]net             panneau /login (typosquat de haveibeenpwned)
unalively[.]com                  serveur de commande du payload (/nfront.php, /nback.php)

# Hôte
%TEMP%\v.msi ; %TEMP%\<chiffres>.ps1   fichiers déposés (le .ps1 n'est jamais supprimé)
pipe nommé aux permissions "tout le monde" ; lecture de Chrome\User Data\Local State
```

Les empreintes de fichiers existent mais vieillissent en quelques minutes (MSI polymorphe) ; je ne les mets pas en avant ici. Les indicateurs réseau et comportementaux, eux, durent.

## Le concept clé

Si tu ne retiens qu'une chose : **cette attaque ne casse aucune serrure, elle convainc l'habitant d'ouvrir la porte.** ClickFix contourne le navigateur, l'IP décimale contourne les filtres d'URL, l'installation par utilisateur évite l'UAC, le MSI polymorphe rend les listes de hashes inutiles, le chargement en mémoire n'écrit aucun fichier, les contrôles anti-VM trompent les bacs à sable. Chaque couche a une cible. Seule la détection comportementale — celle qui regarde *l'enchaînement* plutôt que *le fichier* — voit toute la chaîne.

Et la première ligne de défense, ici, n'est ni un EDR ni un pare-feu : c'est un utilisateur qui sait qu'un CAPTCHA ne demande jamais d'ouvrir **Win + R**. Partage l'info autour de toi, c'est la contre-mesure la plus efficace de toutes.

*Analyse menée les 8, 9 et 12 octobre 2026 (collecte, analyse statique, émulation hors ligne). Si tu veux discuter de la méthodo ou des échantillons, [écris-moi](https://sakoi-cyber.me/contact.html).*
