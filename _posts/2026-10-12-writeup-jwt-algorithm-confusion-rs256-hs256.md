---
lang: en
ref: jwt-confusion
permalink: /en/2026/10/writeup-jwt-algorithm-confusion-rs256-hs256/
title: "Writeup: JWT algorithm confusion (RS256 → HS256)"
description: "How to turn a public key — meant to be shared — into a signing key, and forge an admin token. A classic bug that's still very much alive."
tags: [ctf, web, crypto, jwt]
---

JSON Web Tokens (JWT) are everywhere in modern web authentication. And with them, a family of bugs that keeps coming back challenge after challenge, pentest after pentest: **algorithm confusion**. The idea is deliciously perverse — you turn against the server a key it publishes *on purpose*.

<!--more-->

## Quick refresher: what a JWT is

A JWT is three pieces separated by dots, Base64URL-encoded:

```
header.payload.signature
```

- the **header** states the algorithm, e.g. `{"alg":"RS256","typ":"JWT"}`;
- the **payload** holds the data, e.g. `{"user":"dmod","role":"user"}`;
- the **signature** guarantees nobody tampered with the first two.

As long as the signature is valid, the server trusts the payload. So the whole trick is to produce a valid signature for a payload *you have modified* — for example changing `"role":"user"` to `"role":"admin"`.

## Two families of algorithms

You have to distinguish two ways of signing:

- **HS256** is **symmetric**: the same secret key signs *and* verifies. Whoever knows the secret can forge any token.
- **RS256** is **asymmetric**: a **private key** signs, a **public key** verifies. The public key is meant to be distributed — it "only" allows verification.

RS256's security rests entirely on the fact that signing and verifying use *different* keys. Remember that, it's the whole bug.

## The flaw

Imagine a server that:

1. issues its tokens in **RS256**;
2. publishes its **public key** (normal — it's for verification, often exposed on a `/jwks.json` or `/public.pem` endpoint);
3. chooses the verification algorithm **from the header of the token** you send it.

Point 3 is the mistake. What happens if I craft a token whose header says `{"alg":"HS256"}`?

The server reads "HS256", so it switches to symmetric mode. In symmetric mode, the verification key = the signing key. What key does it have on hand to verify? **Its public key.** So it will verify my HS256 signature using as HMAC secret… the contents of its public key — which I also know, since it's public.

So I can:

1. grab the server's public key;
2. modify the payload (`"role":"admin"`) and the header (`"alg":"HS256"`);
3. compute `HMAC-SHA256(header.payload, public_key)`;
4. send it all.

The server recomputes the same HMAC with the same public key, lands on the same signature, and **validates my admin token**. The key it published to protect itself has become the key that betrays it.

## The trap that trips most people

This is the mistake I made the first time, and the one I see all the time. The HMAC secret must be **exactly** the public key as the server stores it, byte for byte. If its public key is a PEM file:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFA...
-----END PUBLIC KEY-----
```

then the secret is **that entire block**, including the `BEGIN`/`END` lines and the trailing `\n`. One newline too many or too few, and the HMAC no longer matches. When "it should work" but the server refuses, it's almost always this: try the version with the trailing `\n`, then without.

## The exploit skeleton

With `PyJWT`, forcing the algorithm and passing the public key as the secret:

```python
import jwt  # PyJWT

public_key = open("public.pem", "rb").read()  # the server's public key, as-is

forged = jwt.encode(
    {"user": "dmod", "role": "admin"},
    key=public_key,          # the PUBLIC key serves as the HMAC secret
    algorithm="HS256",       # force symmetric
)
print(forged)
```

Depending on the library version, you sometimes have to forge the token by hand (Base64URL of the header and payload, then HMAC), because some recent versions explicitly refuse to sign in HS256 with an RSA-looking key — precisely to prevent this mistake.

## Why it still works

This flaw has been documented for years. Why do we keep meeting it?

- through **permissive defaults**: old JWT libraries chose the algorithm from the received header without the developer noticing;
- through **copy-paste**: a `jwt.verify(token, key)` with no allowed-algorithm list, copied from tutorial to tutorial;
- because the public key is, by nature, **within everyone's reach**.

## How to protect yourself

The rule fits in one sentence: **never let the token choose how it's verified.**

1. **Fix the algorithm server-side** and enforce it at verification:
   ```python
   jwt.decode(token, public_key, algorithms=["RS256"])  # and NOTHING else
   ```
   By explicitly listing `RS256`, a token arriving as `alg: HS256` is rejected outright.
2. **Separate keys by use**: the key that verifies RS256 must never be usable as an HMAC secret.
3. **Reject `alg: none`**, the other great classic (a token with no signature at all).
4. **Update your JWT library**: recent versions block these confusions by default.

## The lesson

Ultimately this flaw is not a cryptography problem — the maths of RS256 and HS256 are solid. It's a problem of **misplaced trust**: the server trusts the attacker to tell it how to verify the attacker's message. Every time user-controlled input decides a security rule, that's where to look. True for JWTs, true everywhere.
