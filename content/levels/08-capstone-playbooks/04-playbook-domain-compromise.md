This is the playbook where remediating too early is a real and common failure. Every other scenario in this level rewards fast containment; this one punishes it, because acting before you understand scope both destroys your visibility and tells the attacker you've noticed.

## Trigger

A DCSync alert. An unexplained Domain Admin. Kerberos anomalies suggesting forged tickets. Defender for Identity flagging replication from a non-DC. Or — most often — a different investigation that escalated once someone checked what the compromised account could actually reach.

## The first decision: scope before remediate

If you reset krbtgt on day one, you lose the ability to observe what the attacker does next, you tip them off, and you may still miss a persistence mechanism that doesn't depend on Kerberos at all. Domain compromise response is deliberately slower at the front: establish scope, plan a coordinated remediation, then execute it all at once.

The exception is active, ongoing damage. If data is actively leaving or systems are actively being destroyed, containment wins over investigation — but make that call explicitly rather than defaulting into it.

## Scoping

Work outward from the confirmed compromise:

- **Credential access** — [DCSync (4662 with replication GUIDs)](#/lesson/l4-05-dcsync-detection), NTDS.dit extraction traces, LSASS access on member servers.
- **Forged tickets** — 4769 without a matching 4768, anomalous lifetimes, RC4 where AES is standard.
- **Directory persistence** — [AdminSDHolder](#/lesson/l4-07-adminsdholder) ACL changes, [ACL grants on Tier 0 objects](#/lesson/l4-10-acl-delegation-abuse), [certificate templates](#/lesson/l4-09-adcs-abuse).
- **When the logs don't reach** — [replication metadata](#/lesson/l4-03-replication-metadata) establishes when directory objects actually changed, independent of whether the Security log survived.

[The AD attack chain overview](#/lesson/l4-14-ad-attack-chain-overview) is the map for this; the playbook is walking it backwards from wherever you entered.

## The remediation event

Domain compromise remediation is a coordinated event, not a sequence of independent fixes:

1. Reset all privileged credentials and service accounts.
2. Revoke every certificate issued from any abused template — [certificates survive password resets and the krbtgt reset entirely](#/lesson/l4-09-adcs-abuse).
3. Clean AdminSDHolder and Tier 0 ACLs, and confirm the cleanup holds through an SDProp cycle.
4. [Double-reset krbtgt](#/lesson/l4-04-krbtgt-double-reset), with the strategy chosen deliberately.
5. Reset the DSRM password and any break-glass accounts.

## The rebuild question

At some level of compromise, remediation stops being credible and rebuilding the forest becomes the honest answer. There is no clean technical threshold for this — it is a risk decision involving the business. What makes it answerable is scope: an organization that knows exactly what the attacker touched can argue for remediation; one that doesn't is choosing between rebuilding and hoping.

## Closure criteria

Every persistence mechanism found is remediated and verified to stay remediated. Privileged credentials rotated. Certificates revoked. krbtgt reset twice. A documented scope statement covering what was accessed. Monitoring specifically tuned for the techniques observed, running for a defined period after remediation.

## Common mistakes

- Resetting krbtgt once, or resetting it before scoping is complete.
- Rebuilding endpoints while leaving directory-level persistence in place.
- Forgetting certificates, which survive every credential rotation.
- Declaring containment without confirming AdminSDHolder-based persistence isn't quietly restoring itself each hour.

## ATT&CK mapping

Spans [OS Credential Dumping (T1003)](https://attack.mitre.org/techniques/T1003/), [Steal or Forge Kerberos Tickets (T1558)](https://attack.mitre.org/techniques/T1558/), [Account Manipulation (T1098)](https://attack.mitre.org/techniques/T1098/), and [Steal or Forge Authentication Certificates (T1649)](https://attack.mitre.org/techniques/T1649/).

## Sources

- [Microsoft Learn — AD Forest Recovery Guide](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-guide)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
