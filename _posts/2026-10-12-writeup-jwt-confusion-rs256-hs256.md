---
lang: fr
ref: jwt-confusion
title: "Writeup : la confusion d'algorithme JWT (RS256 → HS256)"
description: "Comment transformer une clé publique — faite pour être partagée — en clé de signature, et forger un jeton d'administrateur. Une faille classique mais toujours vivante."
tags: [ctf, web, crypto, jwt]
---

Les JSON Web Tokens (JWT) sont partout dans l'authentification web moderne. Et avec eux, une famille de bugs qui revient challenge après challenge, pentest après pentest : la **confusion d'algorithme**. L'idée est délicieusement perverse — on retourne contre le serveur une clé qu'il publie *volontairement*.

<!--more-->

## Rappel express : un JWT, c'est quoi

Un JWT, c'est trois morceaux séparés par des points, encodés en Base64URL :

```
header.payload.signature
```

- le **header** indique l'algorithme, par exemple `{"alg":"RS256","typ":"JWT"}` ;
- le **payload** contient les données, par exemple `{"user":"dmod","role":"user"}` ;
- la **signature** garantit que personne n'a modifié les deux premiers.

Tant que la signature est valide, le serveur fait confiance au payload. Toute l'astuce consiste donc à produire une signature valide pour un payload *que l'on a modifié* — par exemple en passant `"role":"user"` à `"role":"admin"`.

## Deux familles d'algorithmes

Il faut distinguer deux manières de signer :

- **HS256** est **symétrique** : la même clé secrète sert à signer *et* à vérifier. Qui connaît le secret peut forger n'importe quel jeton.
- **RS256** est **asymétrique** : une **clé privée** signe, une **clé publique** vérifie. La clé publique est faite pour être distribuée — elle ne permet « que » de vérifier.

La sécurité de RS256 repose entièrement sur le fait que signer et vérifier utilisent des clés *différentes*. Retiens ça, c'est tout le bug.

## La faille

Imagine un serveur qui :

1. émet ses jetons en **RS256** ;
2. publie sa **clé publique** (c'est normal, elle sert à vérifier — souvent exposée sur un endpoint `/jwks.json` ou `/public.pem`) ;
3. choisit l'algorithme de vérification **d'après le header du jeton** qu'on lui envoie.

Le point 3 est l'erreur. Que se passe-t-il si je fabrique un jeton dont le header dit `{"alg":"HS256"}` ?

Le serveur lit « HS256 », donc il bascule en mode symétrique. En mode symétrique, la clé de vérification = la clé de signature. Quelle clé a-t-il sous la main pour vérifier ? **Sa clé publique.** Il va donc vérifier ma signature HS256 en utilisant comme secret HMAC… le contenu de sa clé publique — que je connais aussi, puisqu'elle est publique.

Je peux donc :

1. récupérer la clé publique du serveur ;
2. modifier le payload (`"role":"admin"`) et le header (`"alg":"HS256"`) ;
3. calculer `HMAC-SHA256(header.payload, clé_publique)` ;
4. envoyer le tout.

Le serveur recalcule le même HMAC avec la même clé publique, tombe sur la même signature, et **valide mon jeton d'admin**. La clé qu'il publiait pour se protéger est devenue la clé qui le trahit.

## Le piège qui fait échouer la plupart des gens

C'est l'erreur que j'ai faite la première fois, et que je vois tout le temps. Le secret HMAC doit être **exactement** la clé publique telle que le serveur la stocke, octet pour octet. Si sa clé publique est un fichier PEM :

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFA...
-----END PUBLIC KEY-----
```

alors le secret, c'est **tout ce bloc**, y compris les lignes `BEGIN`/`END` et le `\n` final. Un retour à la ligne en trop ou en moins, et le HMAC ne correspond plus. Quand « ça devrait marcher » mais que le serveur refuse, c'est presque toujours ça : teste la version avec le `\n` final, puis sans.

## Le squelette de l'exploit

Avec `PyJWT`, en forçant l'algorithme et en passant la clé publique comme secret :

```python
import jwt  # PyJWT

public_key = open("public.pem", "rb").read()  # la clé publique du serveur, telle quelle

forged = jwt.encode(
    {"user": "dmod", "role": "admin"},
    key=public_key,          # la clé PUBLIQUE sert de secret HMAC
    algorithm="HS256",       # on force le symétrique
)
print(forged)
```

Selon la version de la bibliothèque, il faut parfois forger le jeton à la main (Base64URL du header et du payload, puis HMAC), car certaines versions récentes refusent explicitement de signer en HS256 avec une clé d'allure RSA — justement pour empêcher cette faute.

## Pourquoi ça marche encore

Cette faille est documentée depuis des années. Pourquoi la croise-t-on toujours ?

- par **défaut permissif** : d'anciennes bibliothèques JWT choisissaient l'algorithme d'après le header reçu, sans que le développeur s'en rende compte ;
- par **copier-coller** : un `jwt.verify(token, key)` sans liste d'algorithmes autorisés, recopié de tutoriel en tutoriel ;
- parce que la clé publique est, par nature, **à portée de tout le monde**.

## Comment s'en protéger

La règle tient en une phrase : **ne laisse jamais le jeton choisir comment il est vérifié.**

1. **Fixe l'algorithme côté serveur** et impose-le à la vérification :
   ```python
   jwt.decode(token, public_key, algorithms=["RS256"])  # et RIEN d'autre
   ```
   En listant explicitement `RS256`, un jeton qui arrive en `alg: HS256` est rejeté d'office.
2. **Sépare les clés par usage** : la clé qui vérifie RS256 ne doit jamais pouvoir servir de secret HMAC.
3. **Rejette `alg: none`**, l'autre grand classique (un jeton sans signature du tout).
4. **Mets à jour ta bibliothèque JWT** : les versions récentes bloquent ces confusions par défaut.

## La leçon

Au fond, cette faille n'est pas un problème de cryptographie — les maths de RS256 et HS256 sont solides. C'est un problème de **confiance mal placée** : le serveur fait confiance à l'attaquant pour lui dire comment vérifier le message de l'attaquant. Chaque fois qu'une entrée contrôlée par l'utilisateur décide d'une règle de sécurité, c'est là qu'il faut regarder. C'est vrai pour les JWT, c'est vrai partout.
