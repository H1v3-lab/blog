---
lang: en
ref: domain-hardening
permalink: /en/2026/10/securing-my-own-domain-from-f-to-a-plus/
title: "I secured my own domain: from an F to an A+"
description: "HTTP headers, HSTS, a strict CSP, DNSSEC, CAA, DMARC: the logbook of hardening sakoi-cyber.me, and what each setting actually protects."
tags: [defense, web, hardening, privacy]
---

A cybersecurity portfolio scoring an F on securityheaders.com is a bit like a plumber with a leak under the sink. So I turned my own site into a practice ground: target A+, and above all **understand** what each setting protects. Here is the logbook.

<!--more-->

The site is static (HTML/CSS/JS), hosted on GitHub Pages, behind Cloudflare. Everything below is done without an application server: only headers and DNS records. If you host a site, you can reproduce almost all of it.

## First, measure

You don't harden blind. Three free tools give a grade and, more importantly, the list of what's missing:

- **securityheaders.com** for HTTP headers;
- **ssllabs.com/ssltest** for the TLS configuration;
- **hardenize.com** / **internet.nl** for the bigger picture (DNSSEC, DMARC, etc.).

Starting point: F. No security headers, no HSTS, no CSP. Normal — that's the default for a static site.

## HSTS: never speak in the clear again

`Strict-Transport-Security` tells the browser: "for this domain, never use HTTP again, only HTTPS, for the stated duration." It shuts the door on an attack where someone on the same network pushes you to an unencrypted HTTP version.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

`includeSubDomains` extends the rule to every subdomain (my blog included). **Careful**: it's a one-year commitment; before enabling it, you must be certain everything — domain and subdomains — works properly over HTTPS. I left `preload` disabled at first, as it's hard to undo.

## The headers that block classes of attack

Four headers, four distinct protections:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
```

- **X-Frame-Options: DENY** — nobody can show my site in an `<iframe>`. That neutralises clickjacking (layering my site under a fake button).
- **X-Content-Type-Options: nosniff** — the browser doesn't "guess" a file's type. That stops a file dropped as an image from being interpreted as script.
- **Referrer-Policy** — when you leave my site via a link, the destination doesn't receive the full URL you came from. Less browsing-data leakage.
- **Permissions-Policy** — I explicitly disable camera, mic, geolocation, payment, USB. My site doesn't need them; better to forbid them. The `interest-cohort=()` refuses cohort-based ad tracking.

## The CSP: the centrepiece (and the trickiest)

The *Content-Security-Policy* is the most powerful and most painful header to get right. It defines an allowlist: where the browser may load scripts, styles, images, fonts from. Done well, it **neutralises most XSS attacks**: even if an attacker manages to inject `<script>`, the browser refuses to run it because it's not on the allowlist.

My policy, after several iterations:

```
default-src 'self'; script-src 'self' 'sha256-…'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self'; connect-src 'self' https://cloudflare-dns.com;
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
upgrade-insecure-requests
```

The hard part is `script-src 'self'` **without** `'unsafe-inline'`. In other words: no JavaScript written in the middle of the HTML, no `onclick="…"` handlers. It forced me to:

- **move all JavaScript into `.js` files** served by my domain;
- replace the images' `onerror="…"` attributes with a single central event listener;
- allow the one remaining inline script (a small config) by its **SHA-256 hash**, not by a blanket permission.

A side benefit: I took the chance to **self-host my fonts** instead of loading them from Google Fonts. As a result, my site makes **no request to any third party** — which is consistent when you preach privacy.

## At the DNS level: DNSSEC, CAA, DMARC

Headers protect visitors; DNS records protect the domain itself.

**DNSSEC** cryptographically signs DNS answers. Without it, someone could in theory answer in your place — "sakoi-cyber.me is at this other address" — and hijack traffic. With DNSSEC, a forged answer is rejected. You enable it at the DNS host, then deposit a DS record at the registrar.

**CAA** states which authorities may issue a TLS certificate for my domain:

```
0 issue "letsencrypt.org"
0 iodef "mailto:security@sakoi-cyber.me"
```

That stops any other authority from issuing a valid certificate for my domain, and notifies me on any attempt.

**DMARC** protects email:

```
v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s
```

My domain doesn't send mail (it only receives and forwards). So I ask every server to **reject** (`p=reject`) any message claiming to come from `@sakoi-cyber.me`. Nobody can impersonate me by email.

## The result

After all this: **A+** on securityheaders.com, **A/A+** on SSL Labs, DNSSEC and DMARC green. But the grade isn't the goal — verification is. I even added a [Security page](https://sakoi-cyber.me/securite.html) that tests these protections **live in the visitor's browser**: nothing is written "hard-coded", everything is measured on load.

## What I take away

- **Most of these protections are free** and take an hour. There's no reason to skip them.
- The CSP is the best protection/effort ratio against XSS, but it **imposes code hygiene**: zero inline. Take it as a discipline, not a constraint.
- Hardening your own site is the best exercise for understanding what you'll then recommend to others. You only defend well what you've configured yourself.

*sakoi-cyber.me's protections are verifiable live on the [Security page](https://sakoi-cyber.me/securite.html), and the vulnerability-reporting details are in the [security.txt](https://sakoi-cyber.me/.well-known/security.txt).*
