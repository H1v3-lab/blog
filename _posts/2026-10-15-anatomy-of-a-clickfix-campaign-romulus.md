---
lang: en
ref: clickfix
permalink: /en/2026/10/anatomy-of-a-clickfix-campaign-romulus/
title: "Anatomy of a ClickFix campaign: when the victim launches the malware"
description: "Analysis of a real infection chain where no vulnerability is exploited: the user pastes the command themselves. From a fake CAPTCHA to a Chrome key stealer, eight layers built to blind each defense one by one."
tags: [analysis, malware, reverse, defense, clickfix]
---

The most effective flaw isn't always technical. In the campaign I analysed this month — which I call "Romulus", after its operator panel — **no vulnerability is exploited**. The victim copies a command themselves and presses Enter. Everything else is just a sequence of layers built so that, at each step, one specific defense sees nothing.

<!--more-->

> This article is a defensive, educational summary. Indicators are defanged (`hxxp`, `[.]`) and the malicious command is not reproduced as-is. The command-and-control server was never contacted: the analysis is static and by offline emulation.

## ClickFix, or the art of making the victim do the work

Most people have learned to distrust attachments. **ClickFix** sidesteps that reflex by downloading nothing: the lure page shows a fake CAPTCHA or a fake error message, and asks the user to "prove they're human" by doing three things:

1. press **Win + R** (the Windows "Run" box);
2. paste with **Ctrl + V**;
3. confirm with **Enter**.

Meanwhile, a bit of JavaScript has quietly placed a command in the clipboard. The user thinks they're solving a CAPTCHA; in reality they're running code with their own privileges.

The brilliant — and perverse — part is that **the browser downloads no file** and **it's the user who runs the code**. Browser protections and part of the automated defenses have nothing to inspect.

**The rule to remember, for you and those around you: no legitimate CAPTCHA in the world will ever ask you to open the Windows "Run" box.** If a page asks that, it's an attack. Full stop.

## Eight steps, each against one defense

Once the command is launched, eight steps separate the paste from the active malware. What struck me as I unrolled the chain is that it isn't obfuscated at random: **each layer neutralises one precise defense.**

| Layer | Technique | Defense targeted |
| --- | --- | --- |
| Pasted command | Character-by-character reconstruction | Command-line reading |
| Download | IP address written in **decimal** notation | URL and reputation filters |
| Install | `msiexec` in silent, per-user mode | UAC prompt and trusted process |
| Installed file | **MSI generated on the fly**, different each download | Hash lists (signatures) |
| Loading | In-memory decryption, across several layers | Antivirus scanning the disk |
| Loader | **Anti-VM and anti-sandbox** checks | Automated sandbox analysis |
| Payload | Code mapped in memory, no executable on disk | File-based detection |
| C2 | Encrypted JSON (RC4) to a separate domain | Simple network inspection |

Taken one by one, none of these techniques is revolutionary. **Stacked, they form a chain where each link blinds a different sensor** — and only behavioural correlation sees the whole.

## The telling detail: a different MSI every time

One point deserves a pause, because it shows how industrialised these campaigns are. Downloading the **same** installer file **three times** from the distribution server, I got **three different files**: different sizes, different hashes, random internal names, random metadata. None was known to public databases.

In other words, the server **builds a unique installer just before sending it** (the file's internal creation date was two minutes before the download). Direct consequence: **blocking by hash is useless.** The hash is stale by the next download. That's the whole argument for behavioural detection.

## What the malware does once installed

The final payload is a **modular loader**: it does little by itself, it registers with its command-and-control server then runs the tasks it's sent. Translation: the infected machine becomes a **rentable front door**. The attacker can then drop anything — ransomware, another stealer, a remote-access tool.

The capabilities seen in the code (without contacting the server):

- **remote task execution** decided by the server;
- **several injection techniques** into legitimate processes (`explorer.exe`, `RuntimeBroker.exe`…), with parent-process spoofing to muddy the trail;
- **AMSI bypass**, Windows' anti-malware interface;
- **persistence** via the registry, if a task requests it;
- above all, **theft of Chrome's encryption key** (App-Bound Encryption).

That last point is the most painful. With that key, the attacker decrypts **offline** the cookies and passwords saved in Chrome. They can then **hijack already-authenticated sessions — including those protected by two-factor authentication**, since they reuse an already-validated session cookie. That's why a hit machine must be treated as **fully compromised**: changing passwords is not enough, you must invalidate sessions.

## Detect the behaviour, not the file

Since files change at every infection, detection must target the **sequences**. The most reliable observed signals:

- `explorer.exe` → `cmd` with delayed-expansion options → `powershell` with a Base64-encoded command, with a fresh entry in the "Run" box history (`RunMRU`);
- `msiexec` in silent mode on a file in the temp folder, followed by a `powershell` launched by `msiexec` on a random-digit script;
- **private executable memory containing an executable** inside `powershell.exe`;
- an `explorer`, `csc` or `RuntimeBroker` process whose **parent is incoherent**;
- Chrome's `Local State` file being read by a process **other than Chrome**, and a named pipe with overly open permissions.

On the network side: a call to an IP-geolocation service, followed by Base64-encoded `POST` requests to a `.php` script.

## What to do if a machine is hit

1. **Isolate** the machine from the network. Block the known network indicators at the proxy and DNS.
2. **Capture memory before rebooting**: the payload exists only in RAM; a reboot wipes it and destroys the evidence.
3. From a **clean device**, sign out of all sessions, change passwords and **revoke tokens**: Chrome's secrets are to be treated as stolen.
4. **Reinstall the system.** You don't know what was dropped afterwards; you don't clean, you rebuild.
5. **Prevent**: educate users (the famous "no CAPTCHA asks for Win+R"), forbid MSI installs by standard users, enable AppLocker / WDAC.

## Indicators (defanged)

```
# Network
23.94.145[.]93 / .88 / .224      distribution + "Romulus" panel (AS207043)
havelbeenpwned[.]net             /login panel (typosquat of haveibeenpwned)
unalively[.]com                  payload command-and-control (/nfront.php, /nback.php)

# Host
%TEMP%\v.msi ; %TEMP%\<digits>.ps1   dropped files (the .ps1 is never deleted)
named pipe with "everyone" permissions ; read of Chrome\User Data\Local State
```

File hashes exist but age within minutes (polymorphic MSI); I don't foreground them here. The network and behavioural indicators, though, last.

## The key idea

If you remember one thing: **this attack breaks no lock, it convinces the occupant to open the door.** ClickFix sidesteps the browser, the decimal IP sidesteps URL filters, the per-user install avoids UAC, the polymorphic MSI makes hash lists useless, in-memory loading writes no file, the anti-VM checks fool sandboxes. Each layer has a target. Only behavioural detection — the kind that watches *the sequence* rather than *the file* — sees the whole chain.

And the first line of defense here is neither an EDR nor a firewall: it's a user who knows that a CAPTCHA never asks you to open **Win + R**. Spread the word around you, it's the most effective countermeasure of all.

*Analysis conducted on 8, 9 and 12 October 2026 (collection, static analysis, offline emulation). If you'd like to discuss the methodology or the samples, [get in touch](https://sakoi-cyber.me/contact.html).*
