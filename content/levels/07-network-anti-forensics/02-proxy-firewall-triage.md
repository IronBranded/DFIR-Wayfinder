A proxy log is a list of connections, most of them boring. This lesson is about the fields that separate the interesting ones — and none of them require decrypting anything.

## The fields that carry weight

**User-Agent.** Malware frequently uses whatever its HTTP library sends by default, and those defaults are distinctive. `python-requests/2.x`, `curl/8.x`, and PowerShell's `Invoke-WebRequest` — which announces `WindowsPowerShell/5.1` in its default UA string — all identify themselves plainly. Equally telling is a UA claiming to be Chrome from a host where Chrome is not installed, or a UA string with a version that never existed.

**Byte ratio.** Normal browsing is asymmetric in a predictable direction: small request, large response. Invert it and you have a different activity:

| Pattern | Suggests |
|---|---|
| Small out, large in | Normal browsing, downloads |
| Small out, small in, repeated | **C2 beaconing** — check-in with no work to do |
| **Large out, small in** | **Exfiltration** |
| Roughly symmetric, long duration | Interactive session, tunnelling |

**Duration.** A single HTTPS session open for hours to one destination is not browsing. It is either a legitimate long-poll application you can name, or it is not.

**Destination rarity.** A destination contacted by exactly one host in a fleet of thousands is worth more attention than one contacted by everyone. Prevalence-based ranking finds things signature matching does not.

**Domain age.** Newly registered domains correlate strongly with malicious infrastructure, because attacker infrastructure is usually recent. Domain age is a cheap enrichment with real signal.

## JA3: fingerprinting the client, not the destination

**JA3** hashes the parameters a client offers in its TLS Client Hello — cipher suites, extensions, elliptic curves, in order. That combination is a property of the **TLS library and how it was configured**, not of the destination or the certificate.

This is what makes it durable: an attacker changing domains, IPs, and certificates keeps the same JA3 as long as the tooling is unchanged. On [the Pyramid of Pain](#/lesson/l1-04-pyramid-of-pain), a JA3 sits at the tool level rather than the IP or domain level — meaningfully harder to change than the infrastructure it connects to. **JA3S** does the same for the server's response, and the pair together is stronger than either alone.

## Beaconing, again

The same inter-arrival analysis from [DNS](#/lesson/l7-01-dns-analysis) applies to connection logs, with the advantage that byte counts are available too: a beacon shows both **regular timing** and **consistent, small transfer sizes**. Two weak signals that correlate become one strong one.

## Normal baseline

User-Agents match installed browsers and known applications. Byte ratios follow the browsing pattern. Destinations are established, widely-contacted, and business-plausible. Connection durations are short. Long-lived sessions belong to a small set of named applications.

## Red flags

- **A scripting or library User-Agent** (`python-requests`, `curl`, `WindowsPowerShell`) from a host with no development role.
- **A browser User-Agent from a process that is not that browser** — requires endpoint correlation to see.
- **Large outbound with minimal inbound**, sustained.
- **Regular-interval connections with consistent small payloads.**
- **A JA3 matching a known offensive framework**, or a rare JA3 appearing on multiple hosts.
- **A destination registered within the last 30 days.**
- **Connections to a destination contacted by exactly one host in the environment.**

## How to collect it

Proxy and NGFW logs are the primary source; **Zeek** produces richer output including `ssl.log` with JA3 values when configured. Correlate against endpoint process data — [Sysmon Event ID 3 (network connection)](#/lesson/l1-11-sysmon-deployment) attributes a connection to a process, which a proxy log alone cannot do. Enrich destinations with domain age and fleet-wide prevalence before triaging.

## ATT&CK mapping

[Application Layer Protocol: Web Protocols (T1071.001)](https://attack.mitre.org/techniques/T1071/001/), [Non-Standard Port (T1571)](https://attack.mitre.org/techniques/T1571/), [Exfiltration Over C2 Channel (T1041)](https://attack.mitre.org/techniques/T1041/).

## Sources

- MITRE ATT&CK — T1071.001, T1041
- [Salesforce JA3 — TLS fingerprinting](https://github.com/salesforce/ja3)
- [Zeek](https://zeek.org/)
- SANS FOR572 — Advanced Network Forensics and Analysis
