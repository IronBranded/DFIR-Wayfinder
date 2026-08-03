---
tags:
  - Persistence
  - T1053.005
  - T1078.004
  - T1098.001
  - T1098.003
  - T1114.003
  - T1197
  - T1543.003
  - T1546.003
  - T1546.010
  - T1546.012
  - T1546.015
  - T1547.001
  - T1547.004
  - T1547.005
  - T1574.001
  - T1606.002
---

# Module 5: Persistence Catalog

Every persistence mechanism here is written once, tagged with its ATT&CK sub-technique, and linked to from wherever it's relevant — a playbook, an artifact page, a Defender detection. Nothing about persistence gets explained twice in this guide; this module is the single source of truth.

## Structure every entry follows

**Mechanism → ATT&CK ID → where the evidence lives → detection query/approach → cleanup**

## Module status: complete

**Endpoint persistence**

- [x] [Registry Run / RunOnce Keys](registry-run-keys.md) (T1547.001)
- [x] [Scheduled Tasks](scheduled-tasks.md) (T1053.005)
- [x] [Windows Services](windows-services.md) (T1543.003)
- [x] [WMI Event Subscriptions](wmi-subscriptions.md) (T1546.003)
- [x] [COM Hijacking & DLL Search-Order Hijacking](com-dll-hijacking.md) (T1546.015 / T1574.001)
- [x] [AppInit_DLLs & Image File Execution Options](appinit-ifeo.md) (T1546.010 / T1546.012)
- [x] [LSA Provider / Security Support Provider Abuse](lsa-ssp.md) (T1547.005)
- [x] [BITS Jobs](bits-jobs.md) (T1197)
- [x] [Winlogon Shell/Userinit Modification](winlogon-helper.md) (T1547.004)

**Cloud/hybrid identity persistence**

- [x] [Malicious OAuth Application Consent Grants](oauth-consent-grants.md) (T1098.003)
- [x] [Backdoor App Registrations & Service Principal Credentials](backdoor-app-registrations.md) (T1098.001)
- [x] [Mailbox Forwarding Rules & Delegate Access](mailbox-forwarding-rules.md) (T1114.003)
- [x] [Federation Trust Abuse ("Golden SAML")](golden-saml.md) (T1606.002)
- [x] [Break-Glass / Emergency-Access Account Abuse](break-glass-abuse.md) (T1078.004)

Cloud persistence deserves equal billing with endpoint persistence in this catalog — an attacker who gets kicked off a host but left a mail-forwarding rule or an OAuth grant behind hasn't actually been evicted. See [Module 6's hybrid runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now) for the remediation order that accounts for this.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [MITRE ATT&CK Primer](../00-foundations/attack-primer.md)
- [The Pyramid of Pain](../00-foundations/pyramid-of-pain.md)
- [Module 1: Windows Endpoint Forensics](../01-windows-endpoint/index.md)
- [Artifact: Registry Hives](../01-windows-endpoint/registry-hives.md)
- [Malware Triage Methodology](../03-memory-forensics/malware-triage-methodology.md)
- [The Entra Connect Server: A Target in Its Own Right](../06-cloud-identity/entra-connect-as-target.md)
- [Module 6: Cloud Identity (Entra ID / Hybrid)](../06-cloud-identity/index.md)
- [Advanced Hunting with KQL](../07-defender-suite/advanced-hunting-kql.md)
- [Automated Investigation & Remediation: What It Does, and Doesn't, Do](../07-defender-suite/automated-investigation-remediation.md)
- [Playbook: Data Exfiltration](../08-playbooks/data-exfiltration.md)
- [Playbook: Domain Compromise / Lateral Movement](../08-playbooks/domain-compromise.md)
- [Playbook: Ransomware](../08-playbooks/ransomware.md)
- [Volume Shadow Copy Recovery](../anti-forensics/volume-shadow-copy-recovery.md)
- [Enterprise DFIR Field Guide](../index.md)
- [Windows IR Quick Reference](../quick-reference/windows-ir-poster.md)

<!-- BACKLINKS:END -->

