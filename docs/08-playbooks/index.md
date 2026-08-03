---
tags:
  - Playbook
---

# Module 8: Investigation Playbooks

Every playbook below is short on purpose — it's a decision path through Modules 0–7, not a re-explanation of them. Each follows the same shape:

**Trigger → Triage questions → Data to pull → Analysis steps → Contain/Eradicate → Recover → Lessons learned**

(the PICERL shape from [Module 0](../00-foundations/ir-lifecycle.md), applied concretely)

## Module status: complete

- [x] [Business Email Compromise (BEC)](business-email-compromise.md)
- [x] [Domain Compromise / Lateral Movement](domain-compromise.md)
- [x] [Ransomware](ransomware.md)
- [x] [Insider Threat](insider-threat.md)
- [x] [Data Exfiltration](data-exfiltration.md)
- [x] [Phishing (Initial Access)](phishing.md)
- [x] [Web Shell / Server Compromise](web-shell-compromise.md)

Every playbook above links directly into the specific Knowledge Base pages it depends on — for example, the BEC playbook leans heavily on [Module 6's hybrid account-compromise runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now) rather than repeating those steps inline. Where a playbook needs a page that isn't written yet (some Active Directory, Memory Forensics, or PowerShell Forensics detail), it says so directly rather than skipping the reference.

<!-- BACKLINKS:START -->
## Referenced From

- [The Incident Response Lifecycle](../00-foundations/ir-lifecycle.md)
- [Module 2: Active Directory & Domain Controllers](../02-active-directory/index.md)
- [Automated Investigation & Remediation: What It Does, and Doesn't, Do](../07-defender-suite/automated-investigation-remediation.md)
- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

