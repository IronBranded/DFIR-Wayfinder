---
tags:
  - Network Analysis
---

# Proxy & Firewall Log Triage

## What's actually in one of these logs

A typical proxy or firewall connection log entry carries: source/destination IP, destination port, domain or URL, HTTP method, response code, user-agent string (proxy logs specifically), bytes sent and received, and a timestamp. None of it is exotic — the skill is knowing which fields to check first and what "off" looks like in each.

## User-agent mismatches

A request whose user-agent string claims a mainstream browser but whose other behavior doesn't match — no accompanying requests for the CSS/JS/images a real page load would trigger, machine-regular timing, or a raw HTTP client's default user-agent string used verbatim (Python `requests`, PowerShell's default `Invoke-WebRequest` UA, `curl`) — is one of the simplest, highest-signal checks available, precisely because most malicious tooling doesn't bother spoofing this convincingly unless specifically built to.

## Non-standard ports, and the other direction

Traffic on ports outside 80/443 for what claims to be web traffic is a classic red flag — but don't over-anchor on it: plenty of modern C2 frameworks deliberately use port 443 specifically *because* it blends into the overwhelming volume of legitimate HTTPS traffic every environment generates. Absence of a port anomaly isn't clearance; it just means this particular check didn't catch anything.

## Byte-ratio anomalies

Normal web browsing is heavily download-weighted — a small request, a much larger response. A connection sending **substantially more data out than it receives back** inverts that ratio and is worth investigating as a possible exfiltration channel, especially sustained over multiple connections to the same destination rather than a one-off.

## Beaconing intervals

The network-log version of the same concept covered in [DNS Analysis](dns-analysis.md): connections to the same destination at suspiciously consistent intervals, rather than the bursty pattern normal usage produces.

## TLS fingerprinting: use JA4, not JA3

**JA3** (2017, Salesforce) fingerprints a TLS client by hashing characteristics of its handshake — historically useful for spotting known-bad tooling (a commodity RAT's default TLS stack producing a recognizable hash) even inside encrypted traffic, since the handshake itself is unencrypted. **As of current browser versions, JA3 is meaningfully less reliable**: Chrome 110+ and Firefox 114+ randomize the order of TLS extensions specifically to defeat this kind of fingerprinting, so the same client can now produce different JA3 hashes across sessions.

**JA4** (FoxIO) is the current standard, designed specifically to handle that randomization — it sorts extensions before hashing rather than relying on their order, and extends the same fingerprinting concept to additional dimensions (ALPN, HTTP headers, certificates via the broader JA4+ family). If your tooling still only surfaces JA3, treat matches as a weaker signal than they used to be, and correlate against JA4 output where available rather than trusting JA3 alone.

!!! danger "Red flag"
    A user-agent claiming a mainstream browser paired with a TLS/JA4 fingerprint matching a known non-browser HTTP stack, sustained outbound-heavy byte ratios to one destination, or connection intervals clustering suspiciously tightly around a fixed value.

## How you actually use this in an investigation

These checks are strongest layered, not run one at a time in isolation — a single non-standard port means little alone; a non-standard port *and* a mismatched user-agent *and* a regular beaconing interval to the same destination is a much harder pattern to explain away as coincidence. Treat this the same way [Timeline Construction & Correlation](../00-foundations/timeline-construction.md) treats any other evidence: independent corroboration, not a single flagged field, is what justifies acting.

## Turning this into report language

Per the same standard used throughout this guide — state the specific fields and values, not just the conclusion. "Sustained connections from `WKS-4471` to `[destination]:443` showed a 340:1 outbound-to-inbound byte ratio across 12 connections over 3 hours, with a user-agent string not matching any browser installed on the host per software inventory, and a JA4 fingerprint associated with a known post-exploitation framework" is independently verifiable and unambiguous about severity — a reader doesn't need to trust your judgment, they can check every cited fact themselves.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Glossary](../glossary.md)
- [Network & Perimeter Log Analysis](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR572 — network log analysis)
- FoxIO — JA4+ TLS fingerprinting documentation
