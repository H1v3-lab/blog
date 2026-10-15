---
title: "J'ai sécurisé mon propre domaine : de la note F à A+"
description: "En-têtes HTTP, HSTS, CSP stricte, DNSSEC, CAA, DMARC : le journal de bord de la mise en sécurité de sakoi-cyber.me, et ce que chaque réglage protège réellement."
tags: [défense, web, durcissement, vie privée]
---

Un portfolio de cybersécurité qui obtient un F sur securityheaders.com, c'est un peu un plombier avec une fuite sous l'évier. Alors j'ai transformé mon propre site en terrain d'application : objectif A+, et surtout **comprendre** ce que chaque réglage protège. Voici le journal de bord.

<!--more-->

Le site est statique (HTML/CSS/JS), hébergé sur GitHub Pages, derrière Cloudflare. Tout ce qui suit se fait sans serveur applicatif : uniquement des en-têtes et des enregistrements DNS. Si tu héberges un site, tu peux reproduire la quasi-totalité.

## D'abord, mesurer

On ne durcit pas à l'aveugle. Trois outils gratuits donnent une note et, surtout, la liste de ce qui manque :

- **securityheaders.com** pour les en-têtes HTTP ;
- **ssllabs.com/ssltest** pour la configuration TLS ;
- **hardenize.com** / **internet.nl** pour une vue d'ensemble (DNSSEC, DMARC, etc.).

Au départ : F. Pas d'en-têtes de sécurité, pas de HSTS, pas de CSP. Normal, c'est le réglage par défaut d'un site statique.

## HSTS : ne plus jamais parler en clair

`Strict-Transport-Security` dit au navigateur : « pour ce domaine, n'utilise plus jamais HTTP, uniquement HTTPS, et ce pendant la durée indiquée ». Ça ferme la porte à une attaque où quelqu'un, sur le même réseau, te pousse vers une version HTTP non chiffrée.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

`includeSubDomains` étend la règle à tous les sous-domaines (mon blog compris). **Attention** : c'est un engagement d'un an ; avant de l'activer, il faut être certain que tout — domaine et sous-domaines — fonctionne bien en HTTPS. J'ai laissé l'option `preload` désactivée au début, car elle est difficile à annuler.

## Les en-têtes qui bloquent des classes d'attaques

Quatre en-têtes, quatre protections distinctes :

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
```

- **X-Frame-Options : DENY** — personne ne peut afficher mon site dans une `<iframe>`. Ça neutralise le *clickjacking* (superposer mon site sous un faux bouton).
- **X-Content-Type-Options : nosniff** — le navigateur n'essaie pas de « deviner » le type d'un fichier. Ça évite qu'un fichier déposé comme image soit interprété comme du script.
- **Referrer-Policy** — quand on quitte mon site via un lien, le site de destination ne reçoit pas l'URL complète d'où l'on vient. Moins de fuite de données de navigation.
- **Permissions-Policy** — je désactive explicitement caméra, micro, géolocalisation, paiement, USB. Mon site n'en a pas besoin ; autant l'interdire. Le `interest-cohort=()` refuse le pistage publicitaire par cohorte.

## La CSP : la pièce maîtresse (et la plus délicate)

La *Content-Security-Policy* est l'en-tête le plus puissant et le plus pénible à régler. Elle définit une liste blanche : d'où le navigateur a le droit de charger des scripts, des styles, des images, des polices. Bien faite, elle **neutralise la plupart des attaques XSS** : même si un attaquant parvient à injecter du `<script>`, le navigateur refuse de l'exécuter parce qu'il n'est pas dans la liste blanche.

Ma politique, après plusieurs itérations :

```
default-src 'self'; script-src 'self' 'sha256-…'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self'; connect-src 'self' https://cloudflare-dns.com;
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
upgrade-insecure-requests
```

Le point dur, c'est `script-src 'self'` **sans** `'unsafe-inline'`. Autrement dit : aucun JavaScript écrit en plein milieu du HTML, aucun gestionnaire `onclick="…"`. Ça m'a forcé à :

- **sortir tout le JavaScript dans des fichiers** `.js` servis par mon domaine ;
- remplacer les attributs `onerror="…"` des images par un seul écouteur d'événements central ;
- autoriser le seul script inline restant (une petite configuration) par son **empreinte SHA-256**, pas par une autorisation globale.

Bénéfice collatéral : j'en ai profité pour **héberger mes polices** moi-même au lieu de les charger depuis Google Fonts. Résultat, mon site ne fait **aucune requête vers un tiers** — ce qui est cohérent quand on prêche la vie privée.

## Au niveau du DNS : DNSSEC, CAA, DMARC

Les en-têtes protègent les visiteurs ; les enregistrements DNS protègent le domaine lui-même.

**DNSSEC** signe cryptographiquement les réponses DNS. Sans lui, quelqu'un peut en théorie répondre à ta place « sakoi-cyber.me est à cette autre adresse » et détourner le trafic. Avec DNSSEC, une réponse falsifiée est rejetée. L'activation se fait chez l'hébergeur DNS, puis on dépose un enregistrement DS chez le registrar.

**CAA** dit quelles autorités ont le droit d'émettre un certificat TLS pour mon domaine :

```
0 issue "letsencrypt.org"
0 iodef "mailto:security@sakoi-cyber.me"
```

Ça empêche n'importe quelle autre autorité d'émettre un certificat valide pour mon domaine, et me notifie en cas de tentative.

**DMARC** protège le courrier :

```
v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s
```

Mon domaine n'envoie pas de mail (il ne fait que recevoir et rediriger). Je demande donc à tous les serveurs de **rejeter** (`p=reject`) tout message qui prétendrait venir de `@sakoi-cyber.me`. Personne ne peut se faire passer pour moi par e-mail.

## Le résultat

Après tout ça : **A+** sur securityheaders.com, **A/A+** sur SSL Labs, DNSSEC et DMARC au vert. Mais la note n'est pas le but — c'est la vérification. J'ai même ajouté une [page « Sécurité »](https://sakoi-cyber.me/securite.html) qui teste ces protections **en direct dans le navigateur du visiteur** : rien n'y est écrit « en dur », tout est mesuré au chargement.

## Ce que j'en retiens

- **La plupart de ces protections sont gratuites** et prennent une heure. Il n'y a pas de raison de s'en priver.
- La CSP est le meilleur rapport protection/effort contre le XSS, mais elle **impose une hygiène de code** : zéro inline. Prends-la comme une discipline, pas comme une contrainte.
- Durcir son propre site, c'est le meilleur exercice pour comprendre ce qu'on recommandera ensuite aux autres. On ne défend bien que ce qu'on a configuré soi-même.

*Les protections de sakoi-cyber.me sont vérifiables en direct sur la [page Sécurité](https://sakoi-cyber.me/securite.html), et le détail du signalement de faille est dans le [security.txt](https://sakoi-cyber.me/.well-known/security.txt).*
