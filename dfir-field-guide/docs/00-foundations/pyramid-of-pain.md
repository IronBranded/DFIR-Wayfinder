# The Pyramid of Pain

Developed by David Bianco, the Pyramid of Pain ranks indicator types by how much it costs an adversary when you detect on them — not by how easy the indicator is for *you* to collect.

| Level (bottom → top) | Indicator | Cost to the adversary if you detect on it |
|---|---|---|
| 1 | Hash values | Trivial — recompile and the hash changes |
| 2 | IP addresses | Easy — spin up new infrastructure |
| 3 | Domain names | Mildly annoying — needs a new registration |
| 4 | Network/host artifacts | Annoying — has to rebuild tooling behavior |
| 5 | Tools | Real cost — has to find or write a new tool |
| 6 (top) | TTPs (Tactics, Techniques, Procedures) | Painful — has to change *how they operate*, not just *what they use* |

## Why this belongs in Foundations

Every artifact page and persistence entry in this guide is written to support detection as high on the pyramid as possible. A hash-based rule for "known-bad mimikatz.exe" is trivially defeated by recompiling. A behavioral rule for "LSASS opened with read-memory access by a non-standard parent process" is a TTP-level detection — it forces the adversary to fundamentally change their credential-access approach, not just swap a file.

This is also why [Module 5](../05-persistence/index.md) tags every persistence mechanism by ATT&CK technique rather than by known-malware-family name: technique-level detection survives tool churn.

!!! success "How to apply it while hunting"
    When you find an indicator, ask where it sits on the pyramid before you write a detection rule around it. A rule at the hash/IP level needs constant feeding. A rule at the TTP level, once built, keeps working against variants you haven't seen yet.

## Sources

- David J. Bianco, *The Pyramid of Pain* — originally published on his blog, *Enterprise Detection & Response*
- SANS FOR508 threat-hunting methodology
