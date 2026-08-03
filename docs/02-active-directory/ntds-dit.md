---
tags:
  - Active Directory
  - T1003
  - T1003.003
---

# Artifact: NTDS.dit

## What it is / where it lives

`NTDS.dit` is the Active Directory database itself — every user, computer, group, OU, and GPO object in the domain, plus the password hashes for every domain account, all in one file on every Domain Controller.

- **Location:** `%SystemRoot%\NTDS\ntds.dit` (confirm the exact configured path via `HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters\DSA Database file` — it can be relocated)
- **Format:** an ESE/JET database (the same underlying engine historically used by Exchange), locked while the DC is running like any other active database file
- Password hashes stored inside are encrypted with a "boot key" partially derived from the `SYSTEM` hive — meaning a full offline compromise generally requires both `NTDS.dit` and the `SYSTEM` hive together

## Normal baseline

The file is never directly accessed except by the DC's own AD DS service, scheduled/authorized backup jobs, and legitimate `ntdsutil`-based maintenance (defragmentation, integrity checks) performed by AD administrators on a known schedule.

## Red flags

- **Volume Shadow Copy creation on a Domain Controller outside a documented backup window** — one of the most common ways to get a readable copy of a locked `NTDS.dit` without stopping the AD DS service.
- **`ntdsutil` execution**, especially its "IFM" (Install From Media) snapshot-creation capability, run by anyone other than expected AD administration staff.
- **Direct access attempts against the live file path**, or copies of `ntds.dit`/`SYSTEM` appearing anywhere outside the DC itself (a staging directory, an archive, an outbound transfer).

Note what this page does **not** cover: an attacker doesn't need any of the above to extract credentials from AD at all — [DCSync](dcsync-detection.md) achieves the same outcome over the network, using the replication protocol instead of touching this file, which is exactly what makes it the stealthier and far more commonly used technique in practice.

!!! danger "Red flag"
    Unscheduled VSS creation on a DC, `ntdsutil` IFM usage outside planned maintenance, or `ntds.dit`/`SYSTEM` hive copies found off a Domain Controller.

## How to collect it

For legitimate offline analysis (not as an attacker would, but as an investigator reconstructing what happened): extract via `ntdsutil` IFM from a forensic copy, then parse offline with the `DSInternals` PowerShell module or Impacket's `secretsdump.py` to enumerate accounts and hash material for comparison against known-compromised credentials.

## ATT&CK mapping

[T1003.003 (OS Credential Dumping: NTDS)](https://attack.mitre.org/techniques/T1003/003/).

<!-- BACKLINKS:START -->
## Referenced From

- [Module 2: Active Directory & Domain Controllers](index.md)
- [krbtgt: What It Is, and Why It Gets Reset Twice](krbtgt.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory forensics)
- MITRE ATT&CK — T1003.003
