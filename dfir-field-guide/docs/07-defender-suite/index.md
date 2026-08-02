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

## Building now

- [ ] Advanced Hunting (KQL) query patterns for common investigation types
- [ ] Defender for Identity detections mapped to their AD-side artifacts (cross-link to [Module 2](../02-active-directory/index.md))
- [ ] Defender for Cloud Apps: reading an OAuth-consent-grant alert correctly
- [ ] Automated investigation & remediation — what it does on your behalf, and what it doesn't
- [ ] Unified Audit Log / Purview retention tiers and how they gate how far back Defender-adjacent evidence actually goes

## Sources

- [Microsoft Learn — What is Microsoft Defender XDR?](https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender)
