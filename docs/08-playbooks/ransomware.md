---
tags:
  - Playbook
---

# Playbook: Ransomware

## Trigger

Mass file encryption alerts from EDR, a ransom note appearing across multiple hosts or shares, shadow-copy deletion activity (`vssadmin delete shadows`, `wmic shadowcopy delete`), or backup infrastructure suddenly becoming unreachable or showing deletion activity.

## Triage questions

- How many hosts are affected, and is encryption still actively spreading right now?
- What was the initial access vector, and is the entry point still open?
- Is there evidence of data exfiltration *before* encryption began (double-extortion is now the norm, not the exception) — large outbound transfers in the hours/days prior?
- Were backups themselves targeted, deleted, or encrypted?

## Data to pull

- [Process trees](../01-windows-endpoint/process-trees.md) and [Prefetch](../01-windows-endpoint/prefetch.md)/[Amcache](../01-windows-endpoint/amcache.md) on patient zero, to identify the encryptor binary and how it arrived
- [Scheduled Tasks](../05-persistence/scheduled-tasks.md), [Services](../05-persistence/windows-services.md), and other [persistence](../05-persistence/index.md) mechanisms used to propagate across the environment
- Network connection data (`netscan` in [memory forensics](../03-memory-forensics/index.md)) for both lateral spread and any exfiltration channel
- Backup system logs and current backup integrity status

## Analysis

Identify the strain if possible (ransom note format, file extension, encryption tooling behavior) since it can inform expected TTPs and whether decryption is publicly known to be possible. Map the full lateral-movement path from initial access to mass encryption — this is almost always a multi-stage intrusion where encryption is the *final*, loudest step, not the first one. Determine definitively whether data left the environment before encryption; this changes the incident's classification and notification obligations regardless of whether a ransom is ever considered.

## Contain

Isolate every affected host from the network immediately — segment aggressively rather than conservatively while scope is still being established. Disable accounts confirmed or suspected compromised. Preserve evidence (memory captures, disk images) on representative affected hosts *before* any cleanup or reimaging destroys it — the pressure to restore service fast is real, but a fully wiped fleet with no forensic evidence makes root-cause and full-scope determination much harder, if not impossible.

## Eradicate

This requires a full-environment sweep, not spot-cleaning: identify and remove every instance of the encryptor and every persistence mechanism across every touched host — see the [Persistence Catalog](../05-persistence/index.md) systematically rather than relying on what's already been found. Reset credentials for every account with plausible exposure. Whether to engage with the ransom demand at all is a business and legal decision involving leadership and outside counsel, not a technical one — this guide doesn't take a position on it.

## Recover

Restore only from backups confirmed clean and predating the intrusion's known start — restoring from a backup taken *during* the dwell-time window can silently reintroduce the attacker's access. Where confidence in a host's cleanliness is in doubt, rebuild rather than clean.

## Lessons learned

Were backups actually immutable/offline, or reachable (and therefore vulnerable) from the production network? Did network segmentation limit spread the way it was designed to, or did the attacker move through it unimpeded? What was the initial vector, and is that specific gap now closed?

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Malware Triage Methodology](../03-memory-forensics/malware-triage-methodology.md)
- [Module 8: Investigation Playbooks](index.md)
- [Volume Shadow Copy Recovery](../anti-forensics/volume-shadow-copy-recovery.md)
- [Practice Drills](../practice-drills/index.md)
- [Drill: Timeline Correlation](../practice-drills/timeline-correlation-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — ransomware response methodology)
- CISA — StopRansomware guidance and response checklists
- NIST SP 800-61 Rev. 2 (see [Module 0](../00-foundations/ir-lifecycle.md) for the phase structure this playbook follows)
