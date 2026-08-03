---
tags:
  - Playbook
---

# Playbook: Data Exfiltration

## Trigger

A DLP alert, an unusual spike in outbound data volume from a host or account, or an anomalous-download alert from [Defender for Cloud Apps](../07-defender-suite/index.md) — a user or a compromised account pulling down far more data than their normal pattern.

## Triage questions

- What data was accessed, and how sensitive/regulated is it?
- How much left the environment, and through what channel (cloud storage upload, email attachment, USB, an API/automation path)?
- Is this tied to a compromised account (see the [hybrid runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now)) or to insider activity (see the [Insider Threat playbook](insider-threat.md))?

## Data to pull

- Proxy/firewall logs for large outbound transfers around the suspected window
- DLP logs and [Defender for Cloud Apps](../07-defender-suite/index.md) anomalous-download alerts
- [ShellBags](../01-windows-endpoint/shellbags.md) and [USN Journal](../01-windows-endpoint/usn-journal.md) for evidence of data staging beforehand
- Entra ID sign-in logs, if the path was a compromised cloud account rather than an endpoint

## Analysis

Establish, as precisely as the evidence allows, exactly what data left and where it went — this drives everything downstream, including whether breach-notification obligations are triggered. Distinguish a smash-and-grab (rapid, bulk collection immediately after access) from a slower, staged exfiltration, since the latter often indicates either an insider or an attacker with a higher degree of operational patience.

## Contain

Block the specific exfiltration channel (the destination domain/IP, the OAuth app, the account). Revoke any access the exfiltrating party still holds.

## Eradicate

Remove any tooling or persistence used to stage or automate the transfer — check the [Persistence Catalog](../05-persistence/index.md), particularly the cloud-side entries if this ran through a compromised identity rather than direct endpoint access.

## Recover

Work with Legal/compliance to assess breach-notification obligations based on the classification of what was taken — this is usually the highest-stakes recovery decision in this specific playbook, more so than the technical remediation itself.

## Lessons learned

Where was the DLP/monitoring gap that let this reach the point of actual data leaving, rather than being caught at the attempt stage? Was the sensitivity of the affected data actually reflected in its access controls beforehand?

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 8: Investigation Playbooks](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR509/FOR572 — data movement and exfiltration analysis)
- NIST SP 800-61 Rev. 2 (see [Module 0](../00-foundations/ir-lifecycle.md) for the phase structure this playbook follows)
