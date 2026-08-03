---
tags:
  - Foundations
---

# Evidence Handling & Chain of Custody — for Enterprise IR

This guide is written for enterprise defenders, not criminal prosecution — but "we're not going to court" is not the same as "rigor doesn't matter." Three other things routinely depend on the same discipline: cyber-insurance claims, regulatory/breach-notification obligations, and the possibility that today's internal incident becomes tomorrow's civil litigation or law-enforcement referral, at which point sloppy handling from day one can't be fixed retroactively.

## The core principles, adapted for speed

- **Minimize contamination.** Prefer read-only/forensic-copy analysis over touching production originals wherever timelines allow. When you must act on a live host (kill a process, isolate a NIC), do it deliberately and log exactly what you did and when.
- **Hash before you analyze.** Take a SHA-256 of any acquired image or exported log file before working with it. It costs seconds and gives you — and anyone who reviews your work later — proof the evidence wasn't altered in transit.
- **Log the who/what/when of every action.** Every command run against a subject system, every export pulled, every account disabled — timestamped, with the analyst's name attached. In a hybrid/cloud investigation this often means keeping your own IR timeline alongside the platform's own audit log, since your own containment actions (like revoking a session) are themselves recorded in [Entra ID's audit log](../06-cloud-identity/index.md) — cross-reference the two.
- **Preserve before you remediate, where the two conflict.** If eradicating a threat (rebuilding a host, resetting a credential) will destroy evidence you haven't yet captured, capture first — unless active, ongoing harm makes that unsafe to wait for.

## Where enterprise IR rigor differs from a criminal-forensics standard

| Criminal/legal forensics | Enterprise IR (this guide's default) |
|---|---|
| Strict, unbroken chain-of-custody forms for every artifact, built for admissibility | A clear, timestamped internal record — built for defensibility to your own leadership, insurer, or regulator, not a courtroom |
| Bit-for-bit forensic images as the default, before any other action | Live triage collection is often correct first, given business-continuity pressure — full imaging follows if scope demands it |
| Containment often waits for evidence preservation | Containment often *leads*, because stopping active damage outweighs preserving a perfect record, and most incidents never end up in court |

If your organization's specific situation changes this calculus (regulated industry, active litigation hold, law-enforcement involvement), loop in legal counsel early — the threshold for formal chain-of-custody can shift mid-investigation, and it's far easier to have been rigorous from the start than to reconstruct rigor after the fact.

!!! success "Baseline habit"
    Keep a running, timestamped analyst log from the moment you're engaged — even a plain text file. It's the cheapest insurance policy in the entire incident.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 0: Foundations](index.md)
- [Timeline Construction & Correlation](timeline-construction.md)
- [Memory Acquisition](../03-memory-forensics/acquisition.md)
- [Playbook: Insider Threat](../08-playbooks/insider-threat.md)

<!-- BACKLINKS:END -->

## Sources

- SANS FOR500 / FOR508 evidence-handling modules
- NIST SP 800-86, *Guide to Integrating Forensic Techniques into Incident Response*
