---
tags:
  - Active Directory
---

# Module 2: Active Directory & Domain Controllers

Domain Controllers carry artifacts no member server or workstation has — this module exists separately from [Module 1](../01-windows-endpoint/index.md) because DC-specific evidence (replication metadata, NTDS.dit, SYSVOL) needs its own baseline/red-flag treatment, and because AD compromise techniques (DCSync, Golden/Silver Ticket, Kerberoasting) are a distinct enough attack surface to warrant dedicated pages.

## Module status: complete

- [x] [NTDS.dit & the AD Database](ntds-dit.md)
- [x] [SYSVOL & Group Policy Abuse](sysvol-gpo.md)
- [x] [Replication Metadata](replication-metadata.md) (`repadmin`, `msDS-ReplAttributeMetaData`) for reconstructing what changed and when
- [x] [krbtgt](krbtgt.md) — what it is, why it gets reset **twice** after a suspected Golden Ticket, and the replication timing that makes a single reset insufficient
- [x] [DCSync Detection](dcsync-detection.md) — verified extended-right GUIDs and the non-DC-source filter that makes them usable
- [x] [Golden Ticket / Silver Ticket Indicators](golden-silver-ticket.md)
- [x] [AdminSDHolder / SDProp Abuse](adminsdholder.md)
- [x] [Kerberoasting](kerberoasting.md)
- [x] [AD CS Abuse (ESC1/ESC4/ESC8)](adcs-abuse.md)
- [x] [ACL & Delegation Abuse](acl-delegation-abuse.md)

Every entry here will carry its ATT&CK mapping and link directly into the relevant [Investigation Playbook](../08-playbooks/index.md) — most notably *Domain Compromise / Lateral Movement*.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 1: Windows Endpoint Forensics](../01-windows-endpoint/index.md)
- [Defender for Identity: Mapping Alerts to What You Already Know](../07-defender-suite/defender-for-identity-mapping.md)
- [Module 7: Microsoft Defender Suite for IR](../07-defender-suite/index.md)
- [Playbook: Domain Compromise / Lateral Movement](../08-playbooks/domain-compromise.md)
- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

