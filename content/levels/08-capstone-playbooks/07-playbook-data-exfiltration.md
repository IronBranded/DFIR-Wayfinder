This playbook exists to answer one question precisely: **what actually left**. Not what an attacker could have reached, not what they had permission to open — what demonstrably departed. The distinction drives breach-notification scope, regulatory exposure, and the cost of the incident, which makes it one of the highest-stakes analytic problems in DFIR.

## Access is not exfiltration

An account that could read a database did not necessarily read it. An account that read a file did not necessarily copy it out. Each step down that chain narrows the population and raises the confidence, and each is a different evidence source.

This distinction has a concrete forensic expression in cloud audit logs: a `FileAccessed` operation and a `FileDownloaded` operation mean genuinely different things, and tooling that reads a file through an API can generate the former without the latter. Reporting "accessed" as "exfiltrated" overstates the incident; assuming "accessed" means nothing left understates it.

## The retention trap

Proxy logs, NetFlow, and firewall logs are frequently retained for days, not months — and they are often the only source that can size an outbound transfer. **Collect them in the first hour**, before scoping is complete, because they may not exist by the time you know exactly what to ask.

## Evidence by channel

- **Network egress** — proxy and NetFlow volume analysis, by destination and time. Volume works even against encrypted traffic: you may not see contents, but you can see that 40GB left.
- **Cloud storage** — audit operations for download and sync, plus sharing-link creation, which exfiltrates without any download event on your side at all.
- **Email** — message trace for outbound attachments to external and personal addresses.
- **Removable media** — USB device history correlated with file access on the host.
- **Endpoint** — staging directories and archive creation, which often precede transfer and can survive when the transfer logs don't.

## Building the scope statement

The deliverable is a statement with three tiers, kept distinct:

1. **Confirmed exfiltrated** — evidence of the data actually leaving.
2. **Accessed, exfiltration not demonstrated** — the account opened it; no transfer evidence exists either way.
3. **Reachable but no access evidence** — within permissions, no indication it was touched.

Keeping these separate is the whole job. Collapsing them upward inflates notification scope and cost; collapsing them downward is indefensible if evidence later contradicts it. Where logs simply didn't exist, say that explicitly rather than reporting absence of evidence as evidence of absence — regulators generally treat unprovable scope as worst-case scope.

## Closure criteria

Egress logs collected before expiry. Each channel assessed. A three-tier scope statement with stated confidence and stated gaps. Legal and privacy functions given what they need for notification decisions, including an honest account of what could not be determined.

## Common mistakes

- Losing proxy or NetFlow logs to retention before collecting them.
- Reporting access counts as exfiltration counts.
- Assuming encrypted egress is unanalyzable, when volume and destination analysis still work.
- Missing sharing links, which exfiltrate cloud data without generating a download event in your tenant.

## ATT&CK mapping

[Exfiltration Over C2 Channel (T1041)](https://attack.mitre.org/techniques/T1041/), [Exfiltration Over Web Service (T1567)](https://attack.mitre.org/techniques/T1567/), [Exfiltration Over Physical Medium (T1052)](https://attack.mitre.org/techniques/T1052/), [Data from Cloud Storage (T1530)](https://attack.mitre.org/techniques/T1530/).

## Sources

- MITRE ATT&CK — T1041, T1567, T1530
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
