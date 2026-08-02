# Module 2: Active Directory & Domain Controllers

Domain Controllers carry artifacts no member server or workstation has — this module exists separately from [Module 1](../01-windows-endpoint/index.md) because DC-specific evidence (replication metadata, NTDS.dit, SYSVOL) needs its own baseline/red-flag treatment, and because AD compromise techniques (DCSync, Golden/Silver Ticket, Kerberoasting) are a distinct enough attack surface to warrant dedicated pages.

## Building now

- [ ] NTDS.dit & the AD database
- [ ] SYSVOL & Group Policy abuse
- [ ] Replication metadata (`repadmin`, `msDS-ReplAttributeMetaData`) for reconstructing what changed and when
- [ ] krbtgt — what it is, why it gets reset **twice** after a suspected Golden Ticket, and the replication timing that makes a single reset insufficient
- [ ] DCSync detection (Event ID 4662 with directory-replication GUIDs, replication requests from a non-DC source)
- [ ] Golden Ticket / Silver Ticket indicators
- [ ] AdminSDHolder / SDProp abuse
- [ ] Kerberoasting (Event ID 4769 with RC4 encryption requested against service accounts)

Every entry here will carry its ATT&CK mapping and link directly into the relevant [Investigation Playbook](../08-playbooks/index.md) — most notably *Domain Compromise / Lateral Movement*.
