---
tags:
  - Network Analysis
  - T1071
  - T1071.004
  - T1568
  - T1568.002
---

# DNS Analysis

## Why DNS specifically

DNS is one of the few protocols almost never fully blocked outbound — even tightly locked-down environments generally need name resolution to work, which makes it a reliable channel for an attacker regardless of what else is firewalled. Three distinct patterns to know, and they're detected differently.

## DNS tunneling

Data gets encoded into DNS queries and responses themselves — commonly in subdomain labels (`<encoded-data>.attacker-domain.com`) or TXT record content — using DNS as a covert channel for C2 or exfiltration rather than for its intended purpose. This works precisely because DNS traffic is rarely inspected as closely as HTTP/S traffic.

**What to look for:**

- Subdomain labels with unusually high entropy (effectively random-looking character sequences) rather than human-readable names.
- Abnormally long, or abnormally frequent, queries against a single domain.
- A high proportion of TXT or NULL record queries relative to normal A/AAAA-dominated traffic — legitimate DNS traffic skews heavily toward standard address lookups.

## Domain Generation Algorithms (DGA)

Rather than hardcoding a single C2 domain (an easy indicator to block once known), malware using a DGA computes a large list of candidate domain names on a schedule — often date-seeded — and tries each until one resolves, because the attacker has only registered a small subset of the generated list in advance. This defeats static domain blocklisting, since blocking today's known-bad domain does nothing against tomorrow's algorithmically-generated one.

**What to look for:**

- A single host generating a high volume of **NXDOMAIN** (non-existent domain) responses in a short window — the majority of a DGA's generated candidates will fail to resolve, since the attacker only registered a few.
- Queried domain names with DGA-typical characteristics: consistent length, high character-level randomness, absence of real dictionary words — distinct from both tunneling's encoded-payload subdomains and normal human-chosen domains.

## Beaconing

Malware checking in with its C2 infrastructure on a fixed or near-fixed interval produces a query (or connection) pattern that's **suspiciously regular** — organic human and application traffic is bursty and irregular; a host querying the same domain every 60 seconds, near-exactly, for hours, is not behaving like a person using a browser.

**What to look for:** plot query timestamps to a single destination and look for consistent inter-arrival intervals rather than the clustered, uneven pattern normal usage produces. Jitter (small randomized variation added deliberately to defeat this exact detection) is common in more sophisticated tooling — look for a *range* of intervals clustering tightly around a mean, not necessarily an exact repeating number.

## Where the evidence lives

**Sysmon Event ID 22** (DNS query, see [Event Log Key IDs](../01-windows-endpoint/event-log-key-ids.md)) if configured on the endpoint; centralized DNS server query logs for environment-wide visibility; `DeviceNetworkEvents`/DNS-related tables in [Advanced Hunting](../07-defender-suite/advanced-hunting-kql.md) if using Defender for Endpoint.

!!! danger "Red flag"
    High-entropy subdomains or excessive TXT/NULL queries (tunneling); a single host generating many NXDOMAIN responses for algorithmically-patterned domain names (DGA); tightly-clustered, regular-interval queries to one destination (beaconing).

## Turning this into report language

"Suspicious DNS activity was observed" doesn't tell a technical reader what to verify or an executive reader what it means. "Host `WKS-4471` issued 340 DNS queries to randomly-generated subdomains of `[domain]` over a 6-hour window, with query intervals clustering at 58–62 seconds — a pattern consistent with DNS-based C2 beaconing rather than normal application or user traffic" gives the technical reader the exact numbers to independently verify and the executive reader the plain conclusion: this machine was talking to an attacker on a schedule, not browsing normally.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Glossary](../glossary.md)
- [Network & Perimeter Log Analysis](index.md)
- [Proxy & Firewall Log Triage](proxy-firewall-triage.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR572 — DNS-based C2 and exfiltration detection)
- MITRE ATT&CK — [T1071.004 (DNS)](https://attack.mitre.org/techniques/T1071/004/), [T1568.002 (Domain Generation Algorithms)](https://attack.mitre.org/techniques/T1568/002/)
