---
tags:
  - Foundations
  - T1059.001
  - T1059.005
  - T1134
  - T1566
---

# ATT&CK Coverage Map

## What this page is for

Every persistence entry, most artifact pages, and several playbooks in this guide carry a technique ID — but nowhere is that coverage shown as a whole. This page exists specifically to make gaps visible at a glance, including this guide's own: it's an honest map, not a marketing one, and several tactics below are thin on purpose-built content, stated plainly rather than papered over with a loose cross-reference.

## Coverage by tactic

| Tactic | Covered in this guide | Notable gap |
|---|---|---|
| **Reconnaissance** (TA0043) | — | Not covered as its own topic |
| **Resource Development** (TA0042) | — | Out of scope — this is largely pre-compromise infrastructure-building activity outside what an enterprise defender directly observes |
| **Initial Access** (TA0001) | [Phishing playbook](../08-playbooks/phishing.md) (T1566); [AD CS ESC8](../02-active-directory/adcs-abuse.md) touches NTLM-relay-based access | Web shell delivery mechanics ([Web Shell playbook](../08-playbooks/web-shell-compromise.md) covers post-delivery, not the delivery vulnerability classes themselves) |
| **Execution** (TA0002) | [PowerShell Forensics](../04-powershell-forensics/index.md) module (T1059.001) end to end | Non-PowerShell scripting engines (T1059.005/.007) not separately covered |
| **Persistence** (TA0003) | The [Persistence Catalog](../05-persistence/index.md) — 14 entries, endpoint and cloud, this guide's deepest tactic by page count | — |
| **Privilege Escalation** (TA0004) | [Kerberoasting](../02-active-directory/kerberoasting.md), [Golden/Silver Ticket](../02-active-directory/golden-silver-ticket.md), [AD CS abuse](../02-active-directory/adcs-abuse.md), [ACL & Delegation Abuse](../02-active-directory/acl-delegation-abuse.md), [AdminSDHolder](../02-active-directory/adminsdholder.md) | Token manipulation/impersonation (T1134) not separately covered outside the [EPROCESS Token field](../03-memory-forensics/eprocess-internals.md) mention |
| **Defense Evasion** (TA0005) | [Timestomping](../01-windows-endpoint/mft.md), [log clearing & recovery](../anti-forensics/log-artifact-recovery.md), [ADS](../anti-forensics/alternate-data-streams.md), [obfuscation](../04-powershell-forensics/obfuscation-decoding.md), [AMSI/downgrade evasion](../04-powershell-forensics/evasion-detection.md), [injection techniques](../03-memory-forensics/injection-techniques.md) | Signed-binary proxy execution (LOLBins beyond `comsvcs.dll`/`rundll32`) not covered as its own catalog |
| **Credential Access** (TA0006) | [DCSync](../02-active-directory/dcsync-detection.md), [LSASS Memory Analysis](../03-memory-forensics/lsass-memory-analysis.md), [Kerberoasting](../02-active-directory/kerberoasting.md), [Golden/Silver Ticket](../02-active-directory/golden-silver-ticket.md) | Credential access from browsers/password managers not covered |
| **Discovery** (TA0007) | Touched inside [Mutex Analysis](../03-memory-forensics/mutex-analysis.md) and [ACL & Delegation Abuse](../02-active-directory/acl-delegation-abuse.md) | Not a dedicated topic — this is a genuine gap, since discovery/enumeration activity (broad LDAP queries, network scanning) is often the loudest early signal of an attacker orienting themselves, and this guide doesn't yet treat it as its own detection category |
| **Lateral Movement** (TA0008) | [Domain Compromise playbook](../08-playbooks/domain-compromise.md) and [case study](../case-studies/domain-compromise-case-study.md) cover it narratively | Pass-the-hash/pass-the-ticket mechanics not covered as dedicated artifact pages, only referenced |
| **Collection** (TA0009) | — | Not covered as its own topic |
| **Command and Control** (TA0011) | [DNS Analysis](../network-analysis/dns-analysis.md), [Proxy & Firewall Triage](../network-analysis/proxy-firewall-triage.md), [network artifacts in memory](../03-memory-forensics/network-memory-artifacts.md) | C2 framework-specific signatures (Cobalt Strike, Sliver, etc. malleable-profile indicators) not covered by name |
| **Exfiltration** (TA0010) | [Data Exfiltration playbook](../08-playbooks/data-exfiltration.md), byte-ratio analysis in [Proxy & Firewall Triage](../network-analysis/proxy-firewall-triage.md) | — |
| **Impact** (TA0040) | [Ransomware playbook](../08-playbooks/ransomware.md) | Data destruction/defacement outside the ransomware-encryption pattern not separately covered |

## How to use this page

Before assuming a gap in your own environment's detection is a tooling problem, check whether it's actually a **coverage gap in this guide** first — several of the "Notable gap" entries above (Discovery, non-PowerShell execution, LOLBin cataloging) are genuine candidates for this guide's own next additions, not things you're necessarily missing in your own stack.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 0: Foundations](index.md)
- [Tags Index](../tags.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK for Enterprise](https://attack.mitre.org) — canonical tactic list and IDs
