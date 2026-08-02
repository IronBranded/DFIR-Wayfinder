# Enterprise DFIR Field Guide

An interactive, data-driven reference for enterprise digital forensics and incident response — built for defenders working across Windows endpoints, memory, Active Directory, and hybrid/cloud identity.

This is not written for criminal-prosecution workflows. It's built for the SOC analyst, incident responder, and threat hunter who needs to answer one question fast: **is this normal, or is this an incident?**

## How this guide is organized

Two layers, built to work together:

**Knowledge Base** (Modules 0–7) — one canonical page per artifact, log source, or mechanism. Each page follows the same shape: what it is, what normal looks like, what a red flag looks like, how to collect it, and how it maps to [MITRE ATT&CK](00-foundations/attack-primer.md).

**Investigation Playbooks** (Module 8) — scenario-driven workflows (Business Email Compromise, ransomware, insider threat, domain compromise, data exfiltration...) that link into the Knowledge Base rather than repeating it.

New to DFIR? Start at [Module 0: Foundations](00-foundations/index.md) — everything downstream assumes the vocabulary and frameworks introduced there.

Already investigating something specific? Jump straight to the relevant page in [Investigation Playbooks](08-playbooks/index.md).

## Scope

| In scope | Not covered here |
|---|---|
| Windows workstations, laptops, servers, VMs | macOS / Linux endpoint forensics |
| Active Directory & Domain Controllers | Non-Microsoft cloud (AWS/GCP) IAM forensics |
| Windows memory forensics | Mobile device forensics |
| Entra ID, hybrid identity, Microsoft 365 | Network packet-level forensics (see SANS FOR572) |
| Microsoft Defender suite (AV through XDR) | Legal / chain-of-custody procedure for litigation |

## The modules

0. [Foundations](00-foundations/index.md) — methodology and shared frameworks
1. [Windows Endpoint Forensics](01-windows-endpoint/index.md) — filesystem, registry, event logs, process trees
2. [Active Directory & Domain Controllers](02-active-directory/index.md)
3. [Windows Memory Forensics](03-memory-forensics/index.md)
4. [PowerShell Forensics](04-powershell-forensics/index.md) — logging, obfuscation, decoding, fileless execution
5. [Persistence Catalog](05-persistence/index.md) — every mechanism, endpoint and cloud, ATT&CK-tagged
6. [Cloud Identity (Entra ID / Hybrid)](06-cloud-identity/index.md)
7. [Microsoft Defender Suite for IR](07-defender-suite/index.md)
8. [Investigation Playbooks](08-playbooks/index.md) — the scenario layer

## A note on sources

Every page here is original writing, built from the facts, structures, and taxonomies published by SANS (course material and posters), Microsoft Learn/MSTIC, and the wider DFIR community (including practitioners like 13cubed). Nothing is reproduced verbatim — each page links to primary sources for readers who want the original.
