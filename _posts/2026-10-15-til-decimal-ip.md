---
lang: en
ref: til-decimal-ip
permalink: /en/2026/10/til-decimal-ip/
title: "TIL: an IP address can be written as a single number"
description: "23.94.145.93 and 392073565 point to the same machine. Malware uses this to slip past URL filters."
tags: [til, network, malware]
toc: false
---

While analysing an infection chain, I hit a URL like `hxxp://392073565/33829`. That big number **is** an IP address: the decimal form of `23.94.145[.]93`.

<!--more-->

An IPv4 is four bytes. We usually write them in "dotted-decimal" (`a.b.c.d`), but that's only a display convention. You can just as well read the four bytes as **a single 32-bit integer**:

```
23.94.145.93
= 23*256³ + 94*256² + 145*256 + 93
= 392073565
```

Most browsers and network libraries accept this form and resolve it to the same machine. Malware uses it for a simple reason: a URL filter or reputation tool looking for `a.b.c.d` patterns **doesn't see** `392073565` as an IP address, and lets it through.

There are also octal and hexadecimal variants. The defensive lesson: when you write a network detection rule, don't assume IPs are always in dotted-decimal.
