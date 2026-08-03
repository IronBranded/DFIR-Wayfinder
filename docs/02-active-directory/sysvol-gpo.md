---
tags:
  - Active Directory
  - T1484
  - T1484.001
---

# Artifact: SYSVOL & Group Policy Abuse

## What it is / where it lives

SYSVOL is a shared folder replicated across every Domain Controller, holding the actual content Group Policy Objects reference — scripts, templates, and Group Policy Preferences files. GPO abuse is a high-leverage technique precisely because a single change here can push code to every computer the policy applies to, all at once.

- **Location:** `%SystemRoot%\SYSVOL\sysvol\<domain>\`, replicated between DCs via DFSR (or the older FRS on legacy environments)
- **A specific, still-occasionally-relevant historical trap:** Group Policy Preferences once allowed storing local administrator credentials directly in a `Groups.xml` file, encrypted with a key Microsoft published (MS14-025 disclosed and patched the *creation* of new instances of this in 2014) — legacy files created before remediation can still linger in older environments, and it's worth checking for a `cpassword` attribute in any `Groups.xml` found in SYSVOL regardless of how old the environment is.

## Normal baseline

GPO content changes infrequently and through documented change management, generally from a small number of known AD administrators.

## Red flags

- **A GPO's version number incrementing unexpectedly.** Every GPO tracks `gPCMachineVersionNumber`/`gPCUserVersionNumber` attributes that increment on any change — an unplanned bump on a broadly-scoped GPO (especially one linked at the domain or a high-level OU) deserves immediate review of exactly what changed.
- **A new or modified logon/startup/shutdown script referenced by a GPO**, or a newly added scheduled task or registry change pushed via Group Policy Preferences.
- **Any `cpassword` value present in a `Groups.xml` file anywhere in SYSVOL** — regardless of when it was created, it represents a recoverable, plaintext-equivalent credential.

!!! danger "Red flag"
    An unexpected GPO version increment on a broadly-linked policy, a new script or scheduled task delivered via GPO, or any `cpassword` value found in SYSVOL.

## How to collect it

Diff GPO content against a known-good baseline or backup taken before the suspected compromise window. Event ID 5136 (directory service object modified) captures GPO-related AD object changes if Directory Service Access auditing is enabled — see the [Replication Metadata](replication-metadata.md) page for how to pull the full change history for a specific GPO object even without that auditing in place.

## ATT&CK mapping

[T1484.001 (Domain Policy Modification: Group Policy Modification)](https://attack.mitre.org/techniques/T1484/001/).

<!-- BACKLINKS:START -->
## Referenced From

- [ACL & Delegation Abuse](acl-delegation-abuse.md)
- [Module 2: Active Directory & Domain Controllers](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory persistence and abuse)
- MITRE ATT&CK — T1484.001
