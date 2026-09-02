The previous lesson covered stealing the credential database as a file. DCSync does something subtler and considerably quieter: it never touches `NTDS.dit` at all. Instead, it asks a real domain controller to hand over credential material through the same replication protocol DCs legitimately use to sync with each other — and the DC, seeing a properly-authorized request, complies.

## How it works

Domain controllers replicate directory data among themselves using the **Directory Replication Service Remote Protocol (MS-DRSR)**, specifically the `DRSGetNCChanges` call. An attacker holding an account with the right permissions can issue that same call from any machine, impersonating a DC, and request secret attributes — password hashes — for any account in the domain, including [krbtgt](#/lesson/l4-04-krbtgt-double-reset).

Because this is a legitimate protocol operating exactly as designed, there's no malware to detect, no file to find, and no shadow copy to spot. `mimikatz`'s `lsadump::dcsync` and Impacket's `secretsdump.py` both implement it directly.

> [!WARNING]
> DCSync can be run from any domain-joined machine — the attacker does not need to be on a domain controller, or even have code running on one. This is exactly why file-based detection for [NTDS.dit extraction](#/lesson/l4-01-ntds-dit) misses it completely.

## The three permissions that make it possible

DCSync requires an account holding these extended rights on the domain object:

- **Replicating Directory Changes** (`DS-Replication-Get-Changes`)
- **Replicating Directory Changes All** (`DS-Replication-Get-Changes-All`)
- **Replicating Directory Changes In Filtered Set** (in some configurations)

Domain Admins, Enterprise Admins, and Domain Controllers hold these by design. The security question — and the hunt — is whether anything *else* does.

## Detecting it: Event ID 4662

The detection is **Event ID 4662** (an operation was performed on an object), filtered for the replication extended-right GUIDs:

| GUID | Right |
|---|---|
| `1131f6aa-9c07-11d1-f79f-00c04fc2dcd2` | Replicating Directory Changes |
| `1131f6ad-9c07-11d1-f79f-00c04fc2dcd2` | Replicating Directory Changes All |
| `89e95b76-444d-4c62-991a-0facbeda640c` | Replicating Directory Changes In Filtered Set |

A 4662 containing these GUIDs where the requesting account is **not** a domain controller computer account is the signal. Auditing for directory service access must be enabled for these events to exist at all — worth verifying proactively rather than discovering mid-incident.

## Normal baseline

Replication requests originate only from domain controller computer accounts (`DC01$`, `DC02$`, and so on), to other DCs, on the regular replication interval. The set of non-DC principals holding replication rights is empty, or contains only a documented, deliberately-provisioned exception such as an approved directory-sync service account (Entra Connect being the common legitimate case).

## Red flags

- **A 4662 with replication GUIDs from a user account rather than a DC computer account** — the core detection.
- **A 4662 with replication GUIDs originating from a workstation or member server** rather than a DC.
- **Replication rights appearing on a new principal**, visible as an ACL modification on the domain object — the setup step that precedes the attack.
- **A DCSync immediately followed by Kerberos anomalies** — that sequence is often krbtgt theft turning into [Golden Ticket forgery](#/lesson/l4-06-golden-silver-ticket).

## How to collect it

Query the Security log on DCs for Event ID 4662 filtered to the GUIDs above. To audit who currently holds the rights, enumerate the domain object's ACL — `Get-ADObject` with `-Properties nTSecurityDescriptor` on the domain root, or BloodHound's `DCSync` edge, which maps exactly this. Confirm "Audit Directory Service Access" is enabled in DC audit policy before relying on any of it.

## ATT&CK mapping

Maps to [OS Credential Dumping: DCSync (T1003.006)](https://attack.mitre.org/techniques/T1003/006/).

> [!TIP]
> DCSync is most often a *means*, not an end. What follows it is usually [ticket forgery](#/lesson/l4-06-golden-silver-ticket) or [Pass-the-Hash](#/lesson/l4-11-pass-the-hash-pass-the-ticket) — worth checking for both immediately once a DCSync is confirmed.

## Sources

- [Microsoft Learn — MS-DRSR: Directory Replication Service Remote Protocol](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-drsr/)
- MITRE ATT&CK — T1003.006: OS Credential Dumping: DCSync
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
