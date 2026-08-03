---
tags:
  - Practice Drill
---

# Practice Drills

Everything in Modules 0–8 is reference material — what to look for, and why. This section is different: each drill presents **realistic, simulated data** in the format a real tool would actually output, and asks you to find the red flags yourself before revealing the answer.

This wasn't part of the original module plan — it's an addition, built because a reference guide teaches recognition faster when it's paired with practice. It's also intentionally not exhaustive; think of it as a starting set, not full coverage of every artifact in this guide.

!!! tip "How to use these"
    Read the data first. Form a hypothesis about what's normal and what isn't — ideally by name specific entries, not just a gut feeling — *then* expand the answer. Guessing right by instinct is a fine start; being able to articulate *why* an entry is a red flag, citing back to the relevant module page, is the actual skill these drills are for.

## Available drills

| Drill | Tests | Ties to |
|---|---|---|
| [Prefetch Triage](prefetch-drill.md) | Reading simulated `PECmd` output, spotting staged/renamed tooling | [Prefetch](../01-windows-endpoint/prefetch.md) |
| [Process Tree Triage](process-tree-drill.md) | Spotting a spoofed-parentage process in a live process listing | [Baseline Process Trees](../01-windows-endpoint/process-trees.md) |
| [Registry Persistence Triage](registry-persistence-drill.md) | Finding the planted entry among legitimate Run key values | [Registry Run Keys](../05-persistence/registry-run-keys.md) |
| [PowerShell Decode](powershell-decode-drill.md) | Decoding a fresh `-EncodedCommand` string yourself | [Obfuscation & Decoding](../04-powershell-forensics/obfuscation-decoding.md) |
| [Event Log Story](event-log-drill.md) | Reconstructing an attack sequence from raw event IDs alone | [Event Log Key IDs](../01-windows-endpoint/event-log-key-ids.md), [AdminSDHolder](../02-active-directory/adminsdholder.md) |
| [Timeline Correlation](timeline-correlation-drill.md) | Reconciling clock skew across independent sources to find true patient zero | [Timeline Construction & Correlation](../00-foundations/timeline-construction.md), [Ransomware playbook](../08-playbooks/ransomware.md) |

## A note on what these are (and aren't)

Every scenario, dataset, and event sequence on these pages is **original and synthetic** — written for this guide, not pulled from any real incident or vendor sample set. That's why these pages don't carry a "Sources" section the way the rest of the guide does: there's no external material being drawn from. What *is* sourced is every specific technical claim used to build and explain each scenario (a GUID, an event ID, a registry path, an encoding scheme) — each one traces back to a reference page elsewhere in this guide, linked from inside the answer, where the actual sourcing lives.

<!-- BACKLINKS:START -->
## Referenced From

- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

