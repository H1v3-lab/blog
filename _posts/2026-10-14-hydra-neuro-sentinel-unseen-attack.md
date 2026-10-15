---
lang: en
ref: hydra-1
permalink: /en/2026/10/hydra-neuro-sentinel-unseen-attack/
title: "Inside Hydra, episode 1: detecting an attack never seen before"
description: "How Neuro-Sentinel, Hydra's defensive core, spots an intrusion it has no signature for — by first learning what a healthy network looks like."
series: "Inside Hydra"
tags: [hydra, defense, ai, detection, network]
---

Most detection tools work like a bouncer with a list of known faces: if your face is on the list, you don't get in. That's effective against already-catalogued threats, and completely blind to an attack never seen before. And an attack never seen before is exactly what a serious attacker arranges to be.

<!--more-->

In [Hydra](https://sakoi-cyber.me/hydra.html), our autonomous cyber-defense platform, the **Neuro-Sentinel** module carries that question: how do you spot an intrusion you have no signature for? This first episode tells the central idea, and what it gives in the lab.

## The signature problem

A classic IDS compares traffic against a database of known signatures. So someone, somewhere, must already have seen the attack, analysed it, and published its signature. Between the moment a technique appears and the moment its signature is distributed, there is a window — sometimes months — during which the attack is invisible.

For a country or an institution without a 24/7 SOC, that window is fatal. So we took the problem the other way around: instead of learning to recognise the bad, learn to recognise the **good**, then react to anything that departs from it.

## The inspiration: the immune system

Your immune system does not hold a catalogue of every existing virus. It learns very early what the "self" is — your own cells — and triggers a response against anything that isn't. A brand-new virus doesn't need to be known to be attacked: it just needs to be *different from the self*.

Neuro-Sentinel applies that logic to the network:

1. **Learning phase.** At start-up, the module watches traffic and builds a model of what normal activity looks like on this specific infrastructure.
2. **Detection phase.** From then on, every flow gets an **anomaly score**: how far does it stray from the learned normal?

A perfectly ordinary flow goes unnoticed. An unusual one — a scan, an exfiltration, an unexpected protocol on an unexpected port — stands out, even if nobody has ever published a signature for it.

## Under the hood

The algorithm that carries the immune analogy is called **negative selection** (NSA, *Negative Selection Algorithm*), from artificial immune systems. Like lymphocytes, "detectors" are trained to never react to the self; anything that activates them is, by construction, foreign.

Negative selection alone struggles in high-dimensional spaces — and a network flow has many dimensions. So we combine it with two proven anomaly detectors, via the PyOD library:

- an **Isolation Forest**, which isolates rare points by "cutting" them off faster than dense ones;
- a **One-Class SVM**, which draws a boundary around the region of the normal.

Three different looks at the same question "is this normal?", whose verdicts we aggregate. That cuts the false positives of any single detector taken alone.

## Decide, then respond without breaking everything

Detecting is not enough: you have to react, and react proportionately. A reinforcement-learning agent (PPO, via stable-baselines3) chooses the response, bounded by guardrails tied to the anomaly score and the packet volume — so that a poorly trained agent doesn't get stuck on a single action.

The response is **graduated**, like an immune reaction:

| Level | Response | Effect |
| --- | --- | --- |
| 0 | Logging | We record and watch |
| 1 | Quarantine | The suspicious container is isolated from the network |
| 2 | Ban | The source IP is blocked, with expiry |
| 3 | Redirection | Traffic is diverted to a honeypot |

We don't bring out the heavy artillery for a sneeze, but we can scale up if the anomaly persists.

## What it gives in the lab

Our test bench simulates a small infrastructure under Docker, with a separate DMZ and internal network. The striking result: during an `nmap` scan launched from the attacker container, Neuro-Sentinel detected it then quarantined the target, making it unreachable — **with no `nmap` signature**, purely because that traffic didn't look like the learned normal.

On a broader test of **2,509,611 flows analysed**, the module raised **3 alerts** and performed **3 quarantines**. Few alerts, then, but relevant ones — which is exactly the goal: a defender drowning in false positives ends up ignoring everything.

## What remains to be done

The approach has limits, which we own:

- the learning phase assumes the initial traffic is *healthy*; if the attacker is already there during learning, they become the "self";
- a slow, quiet attacker who mimics normal traffic remains the hard case;
- we still have to test the model against **polymorphic** attacks, which change shape to evade detection.

That's the next build. In the next episode I'll tell you about **Aegis**, Hydra's offensive head: the autonomous attacker that both audits the infrastructure and generates the traffic that trains Neuro-Sentinel. Because you only defend well what you've already attacked yourself.

*Hydra is our final-year project, presented at JPOPE 2026. The full write-up is [on the portfolio](https://sakoi-cyber.me/hydra.html).*
