---
tags:
  - Anti-Forensics
---

# Volume Shadow Copy Recovery

## What it is, and why it's a recovery goldmine

Volume Shadow Copy Service (VSS) creates point-in-time snapshots of a volume — originally for Windows' own System Restore and "Previous Versions" features, but forensically, a shadow copy is a **complete snapshot of the filesystem as it existed at that moment**, sitting right there on the same disk. If an attacker deleted a file, cleared a log, or modified the registry *after* a shadow copy was taken, that shadow copy may still hold the pre-tampering version — untouched by anything that happened afterward.

This is exactly why [the Ransomware playbook](../08-playbooks/ransomware.md) flags shadow-copy deletion (`vssadmin delete shadows`, `wmic shadowcopy delete`) as a red flag in its own right: a competent attacker knows shadow copies are a recovery path and tries to remove them specifically to prevent it. Their absence doesn't mean nothing to recover — it means check whether *older* shadow copies, taken before the deletion command ran, still survive.

## How to enumerate and mount one

```
vssadmin list shadows
```

(add `/for=C:` to scope to a specific volume) lists available shadow copies, each with a device path resembling `\\?\GLOBALROOT\Device\HarddiskVolumeShadowCopyN\`.

Mount a specific one as a browsable directory:

```
mklink /d C:\VSC_Analysis \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy4\
```

**The trailing backslash on the device path is not optional** — omitting it is the most common reason this command silently fails to produce a usable link. Once mounted, browse `C:\VSC_Analysis` with any normal tool exactly as if it were a live drive — it's read-only by nature of how VSS works, so there's no risk of contaminating the snapshot.

## Working with shadow copies inside a forensic image

`vssadmin` requires a live, mounted Windows volume — for an offline forensic image, `libvshadow` (Joachim Metz — the same author as the [Plaso](../00-foundations/timeline-construction.md) project) is the standard tool, ships by default on the SIFT Workstation:

```
vshadowinfo -f disk.dd          # enumerate shadow copies within an image, no mounting needed
vshadowmount -f disk.dd mountdir/  # mount each shadow copy to its own subdirectory for analysis
```

## What to actually pull once you have access

- The specific file(s) you already know are relevant, at their pre-tampering state — direct comparison against the current, tampered version can itself become evidence of what changed.
- A copy of `.evtx` log files if the live ones were [cleared](log-artifact-recovery.md) — see that page's recovery-avenue table; a surviving shadow copy is usually the fastest and most complete option when one exists.
- Registry hives as they existed at snapshot time, for comparing against current [persistence](../05-persistence/index.md) findings to establish when a change was actually made.

## The honest limitation

Shadow copies are created on a schedule (or triggered by specific system events, like before a Windows Update), not continuously — there's no guarantee one exists from close enough to the incident window to be useful, and Windows automatically ages out and deletes older shadow copies as disk space is needed for new ones regardless of any attacker action. Check what's available before building an investigative plan that depends on it.

## Turning this into report language

"A prior version of the file was reviewed" understates what actually happened and how it's justified. "A Volume Shadow Copy created at [timestamp], predating the attacker's first confirmed access by approximately six hours, was mounted and found to contain an intact copy of `Groups.xml` without the malicious GPP modification present in the current version — confirming the GPO tampering occurred after this snapshot and providing a verified pre-compromise baseline" ties the recovery technique directly to a specific, dated conclusion, which is the difference between "we found an old copy" and a defensible timeline anchor.

<!-- BACKLINKS:START -->
## Referenced From

- [Anti-Forensics & Data Recovery](index.md)
- [Log & Artifact Recovery](log-artifact-recovery.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- Microsoft Learn — Volume Shadow Copy Service technical reference
- `libvshadow` (Joachim Metz) documentation
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500/FOR508 — Volume Shadow Copy forensics)
