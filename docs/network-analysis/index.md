---
tags:
  - Network Analysis
---

# Network & Perimeter Log Analysis

This module is deliberately scoped narrow. Full packet-level forensics — capturing and dissecting raw traffic — is its own discipline (SANS FOR572's entire focus), and it's out of scope here on purpose, not by oversight. What belongs in *this* guide: the network-adjacent log sources this guide already leans on constantly — as the [clock-skew calibration source](../00-foundations/timeline-construction.md) in the Domain Compromise case study, as the corroborating source behind half the "Red flag" callouts in earlier modules — without ever having taught what's actually in one or how to read it.

## What's here

- [DNS Analysis](dns-analysis.md) — DNS tunneling, domain generation algorithms (DGA), and beaconing patterns visible in query logs alone
- [Proxy & Firewall Log Triage](proxy-firewall-triage.md) — reading a connection log for what actually matters: user-agent mismatches, beaconing intervals, byte-ratio anomalies, and current TLS fingerprinting

<!-- BACKLINKS:START -->
## Referenced From

- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR572 — network forensics, for readers who want the full discipline this module deliberately doesn't cover)
