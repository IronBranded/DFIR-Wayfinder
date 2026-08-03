---
tags:
  - Defender Suite
---

# Module 7: Microsoft Defender Suite for IR

"Microsoft Defender" is six differently-licensed products that share a brand name — knowing which one you're looking at, and what it does and doesn't cover, matters for scoping an investigation correctly.

## The family, mapped

| Product | What it actually is | Runs where |
|---|---|---|
| **Defender Antivirus** | The built-in, real-time antivirus/anti-malware engine in Windows itself. Present on every modern Windows box regardless of licensing. | Local, every endpoint |
| **Defender for Endpoint (MDE)** | Cloud-backed EDR — advanced hunting, device timeline, alerts, automated investigation. Defender AV is the sensor underneath it. Formerly branded *Windows Defender ATP*. | Endpoint agent + cloud portal |
| **Defender for Identity** | Monitors on-prem AD signals for identity attacks — DCSync, Golden Ticket, Kerberoasting patterns — by watching Domain Controller traffic and logs. | Sensor on Domain Controllers |
| **Defender for Cloud Apps** | The CASB (Cloud Access Security Broker) — OAuth app risk, impossible-travel-style anomaly detection across SaaS. Formerly *Microsoft Cloud App Security (MCAS)*. | Cloud, API + proxy-based |
| **Defender for Office 365** | Email/collaboration protection — Safe Links, Safe Attachments, phishing/impersonation detection. | Exchange Online / M365 |
| **Defender for Cloud** | A *different* product again — Azure/multi-cloud workload security posture (CSPM) and workload protection. **Not** one of the four that correlate into XDR below. | Azure Resource Manager scope |

**Defender XDR** is the unifying layer: Defender for Endpoint, Defender for Identity, Defender for Office 365, and Defender for Cloud Apps correlate their signals into one incident view at `security.microsoft.com`, with cross-product automated investigation and response. Defender for Cloud stays separate — a common licensing and scoping mix-up worth catching early in an investigation, before assuming a signal exists somewhere it doesn't.

## Why Defender AV gets its own line even without full XDR licensing

An organization running only base Windows with Defender AV — no E5, no MDE — still has a forensically useful local artifact: the **Windows Defender operational event log** (`Microsoft-Windows-Windows Defender/Operational`), including detection events (ID 1116), remediation-action events (ID 1117), and real-time-protection-disabled events (ID 5001, itself worth alerting on as a likely defense-evasion signal). Don't assume "no MDE license" means "no Defender telemetry at all."

## Module status: complete

- [x] [Advanced Hunting with KQL](advanced-hunting-kql.md) — query templates tied directly to Modules 1, 3, and 4
- [x] [Detection Engineering](detection-engineering.md) — turning a hunt query into a tuned, standing detection rule
- [x] [Defender for Identity: Mapping Alerts](defender-for-identity-mapping.md) — verified alert names mapped to [Module 2](../02-active-directory/index.md)'s AD techniques
- [x] [Defender for Cloud Apps: Reading an OAuth Alert](defender-cloud-apps-oauth.md) — the triage companion to [Module 5's OAuth persistence entry](../05-persistence/oauth-consent-grants.md)
- [x] [Automated Investigation & Remediation](automated-investigation-remediation.md) — what it does on your behalf, and what it doesn't

For Unified Audit Log / Purview retention tiers, see [Module 6](../06-cloud-identity/sign-in-vs-audit-logs.md) — the same retention picture applies to Defender-adjacent evidence and isn't repeated here.

<!-- BACKLINKS:START -->
## Referenced From

- [Persistence: Malicious OAuth Application Consent Grants](../05-persistence/oauth-consent-grants.md)
- [Playbook: Data Exfiltration](../08-playbooks/data-exfiltration.md)
- [Playbook: Insider Threat](../08-playbooks/insider-threat.md)
- [Playbook: Phishing (Initial Access)](../08-playbooks/phishing.md)
- [Glossary](../glossary.md)
- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — What is Microsoft Defender XDR?](https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender)
