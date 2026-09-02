DNS is the most underused log source in most environments, and close to the most valuable. Nearly every intrusion touches it — malware has to resolve a name before it can call home — and the three patterns that matter are all visible in **query logs alone**, with no packet capture and no TLS interception required.

## What a query log gives you

Timestamp, client, query name, query type, and response. That is enough for everything below.

## Pattern 1: DNS tunnelling

Data encoded into subdomain labels, with responses carrying data back in `TXT`, `NULL`, or `CNAME` records. The DNS resolver forwards it faithfully, because it is a valid query.

Tells, none of which require decoding anything:

- **Abnormally long query names** — encoded payload pushes toward the 253-character limit
- **High-entropy subdomains** — base32/base64 output does not look like a hostname
- **High query volume to a single parent domain**, often thousands of unique subdomains under it
- **Unusual record types**, particularly `TXT` and `NULL`, in volume
- **Very low TTLs**, preventing caching so each request reaches the attacker

## Pattern 2: Domain generation algorithms

Malware generates pseudo-random domain names on a schedule and tries each until one resolves. The operator registers only a few.

The signature is **failure**, not success:

- **A high `NXDOMAIN` rate from a single host** — most generated domains were never registered
- **Many unique domains queried in a short window**
- **High-entropy names** that do not resemble human-chosen domains
- **A single eventual success** among many failures, which is the actual C2

## Pattern 3: Beaconing

Regular-interval queries to the same domain. Attackers add **jitter** — randomized delay — to break the pattern, but jitter widens the distribution rather than removing it. Computing inter-arrival times and looking for low variance still surfaces it, and 20–30% jitter is entirely visible statistically.

## The evasion worth knowing: DNS over HTTPS

**DoH bypasses internal DNS logging completely.** The query travels as HTTPS to a public resolver, so the internal DNS server never sees it and none of the above applies.

Detection shifts to the connection layer: HTTPS connections to known DoH provider endpoints, particularly **from a process that is not a browser**. Blocking or forcing DoH through internal resolvers is the preventive control; monitoring for it is the detective one.

## Where the logs come from

| Source | Gives you |
|---|---|
| Windows DNS Server Analytical log | Server-side queries, all clients |
| **Sysmon Event ID 22** | **Query attributed to a specific process** |
| Zeek `dns.log` | Network-level, protocol-parsed |
| EDR telemetry | Usually process-attributed |

> [!IMPORTANT]
> Sysmon Event ID 22 is the one that changes what you can conclude. Server-side logs tell you a **host** made a query. Event ID 22 tells you **which process** did — the difference between "this workstation resolved a suspicious domain" and "`rundll32.exe` resolved a suspicious domain," which is a finding rather than a lead.

## Normal baseline

Queries resolve to known destinations consistent with installed software and business use. `NXDOMAIN` rates are low and evenly distributed rather than concentrated on one host. Record types are dominated by `A`, `AAAA`, and `CNAME`. Query names look like names.

## Red flags

- **Query names near the length limit with high-entropy labels.**
- **A single host generating a disproportionate share of the environment's `NXDOMAIN` responses.**
- **`TXT` or `NULL` query volume** from an endpoint with no reason to use them.
- **Regular inter-arrival timing** to one domain, jitter notwithstanding.
- **DoH endpoint connections from a non-browser process.**
- **Queries to newly registered domains**, which correlates strongly with malicious infrastructure.

## How to collect it

Enable the Windows DNS Server **Analytical** log (not the deprecated debug log) on internal resolvers. Deploy [Sysmon](#/lesson/l1-12-sysmon-deployment) with Event ID 22 enabled for process attribution. For beaconing analysis, extract inter-arrival times per (host, domain) pair and look for low standard deviation. [RITA](#/lesson/l6-04-c2-framework-fingerprinting) and similar tooling automate the statistical side.

## ATT&CK mapping

[Application Layer Protocol: DNS (T1071.004)](https://attack.mitre.org/techniques/T1071/004/), [Dynamic Resolution: Domain Generation Algorithms (T1568.002)](https://attack.mitre.org/techniques/T1568/002/), [Exfiltration Over Alternative Protocol (T1048)](https://attack.mitre.org/techniques/T1048/).

## Sources

- MITRE ATT&CK — T1071.004, T1568.002
- [Microsoft Learn — DNS Analytical logging](https://learn.microsoft.com/en-us/windows-server/networking/dns/dns-analytic-logging)
- SANS FOR572 — Advanced Network Forensics and Analysis
