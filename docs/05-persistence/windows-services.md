---
tags:
  - Persistence
  - Endpoint
  - T1543
  - T1543.003
---

# Persistence: Windows Services

**ATT&CK:** [T1543.003](https://attack.mitre.org/techniques/T1543/003/) — Create or Modify System Process: Windows Service

## The mechanism

A malicious service survives reboots, typically runs as `SYSTEM`, and — because it's launched by the Service Control Manager rather than a user session — doesn't show up anywhere near the process trees a user's activity would generate. Attackers either create a new service or, more subtly, modify an existing legitimate one's binary path.

- **Registered under:** `HKLM\SYSTEM\CurrentControlSet\Services\<ServiceName>`
- **Created via:** `sc.exe create`, `New-Service`, or directly writing the registry key

## Where the evidence lives

- Event ID 7045 (**System** log — "A service was installed") — logged by default with no special auditing required, which makes it one of the more reliable service-creation signals available out of the box
- Event ID 4697 (Security log) — requires Object Access auditing
- The `ImagePath` value under the service's registry key — check this even for services that already existed; a modified `ImagePath` on a legitimate-looking service name is a common evasion move

## Detection approach

Alert on every 7045 event and triage by binary path and service name plausibility — a service with a random or generic name, or a legitimate-sounding name pointing at a binary in an unexpected location, deserves a look. For existing services, periodically diff `ImagePath` values against a known-good baseline; a change here without a corresponding patch/update event is a strong signal.

!!! danger "Red flag"
    A newly created service with a generic or misleading name, or an `ImagePath` change on an existing service with no corresponding legitimate update.

## Cleanup

Stop and delete the service (`sc.exe delete`), and if `ImagePath` was hijacked on a legitimate service, restore the original path rather than just deleting the service outright.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)
- [Playbook: Ransomware](../08-playbooks/ransomware.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1543.003](https://attack.mitre.org/techniques/T1543/003/)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — persistence hunting)
