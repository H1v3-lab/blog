---
lang: en
ref: privacy-stack
permalink: /en/2026/10/my-privacy-stack-tool-by-tool/
title: "My privacy stack, tool by tool"
description: "The tools I use every day to reduce what I expose, encrypt what I keep, and never hand a service more than it needs — with the reasoning behind each choice."
tags: [privacy, encryption, tools]
---

Privacy is not a checkbox, it's a series of small decisions made every day. I don't claim to be invisible — nobody is — but I try to **reduce my attack surface** and keep control of my data. Here is my toolbox, and above all the reasoning behind it.

<!--more-->

One principle first: the threat model. You don't protect yourself the same way against an advertiser who wants to track you, a nosy neighbour, or a state-level adversary. Most of these tools target the first and second — mass commercial surveillance — which concern everyone, every day.

## Mail: Proton Mail

Email is the keyring of your digital life: whoever controls your inbox can reset almost all your other accounts. I'm on **Proton Mail** for two reasons: end-to-end encryption between Proton users, and above all a business model where **I am the customer, not the product**. Gmail is free because your mail feeds ad targeting; Proton is paid because you pay for a service, full stop.

A detail that matters: I use an address on my own domain that **forwards** to Proton. My personal address appears nowhere publicly; if a contact address leaks or drowns in spam, I change it without touching my real inbox.

## Passwords and aliases: Proton Pass

One unique password per service, long and random, stored in a manager: that's the security advice with the best effort/benefit ratio, by far. I use **Proton Pass**, but any good manager (Bitwarden, KeePassXC) beats reused passwords infinitely.

The feature I like most is **email aliases**: each service gets a different throwaway address. Benefits:
- if a site gets breached, the alias leads nowhere else;
- I immediately see **who sold my address** (spam lands on that specific service's alias);
- I kill a compromised alias with no impact on the rest.

## Network: Proton VPN

A VPN does not make you anonymous — a common misunderstanding. What it does: it stops your ISP (or a café's Wi-Fi) from seeing *which* sites you visit, and it hides your IP from the sites you visit. I keep two criteria in mind: a credible, audited **no-log policy**, and a sound business model. A "free VPN" pays for itself by reselling your traffic: exactly what we were trying to avoid.

## Browsers: Brave and Zen

The browser is where most tracking plays out. I use two:

- **Brave** for everyday browsing: built-in tracker and ad blocking, no extension to configure.
- **Zen**, Firefox-based, telemetry-free, when I want a leaner, more customisable environment.

The common thread: not depending on a browser whose maker lives off targeted advertising. Again, the question "who pays, and how?" drives the choice.

## Anonymity when it matters: Tor

Tor isn't for every day — it's slow, and that's not the point. But when the need is **real anonymity** (consulting a sensitive resource, fully separating an activity from my identity), the Tor browser routes traffic through several relays, so that no single link knows both who you are and what you're consulting.

## Local encryption: GnuPG

To sign or encrypt files and messages, **GnuPG**. My public key is [published on my domain](https://sakoi-cyber.me/pgp.asc): anyone can send me an encrypted vulnerability report that only I can read. The private key, meanwhile, never leaves my machine and has an offline backup.

## What it changes, concretely

None of these tools is magic, and piled up without method they give a false sense of security. What counts is consistency:

- **reduce** what I expose (aliases, domain address, no real public identifiers);
- **encrypt** what I keep (mail, passwords, sensitive files);
- **never hand** a service more than strictly necessary, and prefer those whose business model doesn't rest on my data.

And an honest reminder: the weakest link is almost always the human, not the tool. A good password manager and two-factor authentication do more for your real security than any exotic setup. Start there.
