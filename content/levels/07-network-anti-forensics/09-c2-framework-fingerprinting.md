[NetFlow analysis](#/lesson/l7-03-netflow-analysis) covers beaconing as a *pattern* — regular intervals, consistent byte counts. This lesson covers the layer beneath that: the specific, fingerprintable characteristics that identify *which* C2 framework is behind that pattern, well before behavioral analysis alone would tell you.

## Cobalt Strike: the one you'll encounter regardless of attacker sophistication

Cobalt Strike shows up in the majority of ransomware intrusions and nation-state operations alike — cracked copies circulate freely, and it has effectively become the default C2 framework across the threat landscape rather than a marker of any particular skill level.

**Malleable C2 profiles** let an operator customize nearly everything about a beacon's network footprint — disguising traffic to look like jQuery, OneDrive, or Amazon requests. This defeats simple signature matching on URIs or User-Agent strings, but doesn't defeat everything:

- **JA3/JA3S** fingerprints the TLS Client Hello (JA3) and Server Hello (JA3S) — the specific combination of SSL version, cipher list, extensions, and elliptic curves a client offers, largely independent of the application-layer disguise a Malleable profile applies. **JA4** is the newer, more robust successor, designed specifically to raise the cost of the JA3-randomization tools attackers now use to evade JA3 alone.
- **Named pipes** — Cobalt Strike's default pipes follow patterns like `\msagent_*` and `\postex_*`, used to relay post-exploitation tool output back to the beacon. These can be renamed via the Malleable profile, but in practice most operators don't bother — Sysmon Event IDs 17/18 (pipe created/connected) are worth explicit configuration to capture this.
- **Behavioral tells that survive any profile**: beacon rhythm at regular intervals with low jitter variance, short-lived sessions with low data volume per check-in — the same statistical periodicity [NetFlow analysis](#/lesson/l7-03-netflow-analysis) already teaches you to spot, just confirmed here at the TLS layer too.

> [!PLAIN]
> Do not rely on JA3/JA4 alone. A sophisticated operator can randomize their TLS fingerprint deliberately. Treat fingerprinting as one strong signal among several — named pipes, beacon rhythm, and process-injection artifacts together — not a single silver bullet.

## Beyond Cobalt Strike

Sliver and other modern open-source C2 frameworks follow the same general playbook — configurable network profiles to disguise application-layer traffic, but a TLS handshake and a connection rhythm that fingerprinting and behavioral analysis still expose. The specific indicators differ framework to framework and change as frameworks evolve; the *methodology* — fingerprint the handshake, watch the rhythm, check the process-level artifacts — transfers directly regardless of which framework is behind a given intrusion.

## Normal baseline

Legitimate application traffic — even traffic disguised to look like it via a Malleable profile — doesn't sustain the same rhythm: human-driven browsing is bursty and irregular, and genuine API/service traffic tends to correlate with actual application load rather than firing at a fixed interval regardless of what else is happening on the host.

## Red flags

- **A JA3/JA4 hash matching a known-bad list** (SSLBL and similar threat-intel feeds maintain these) for a connection whose application-layer traffic looks otherwise legitimate.
- **Named pipe creation matching known C2 framework patterns**, especially paired with process injection into a common host process like `rundll32.exe` or `explorer.exe`.
- **DNS A-record queries for subdomains of a single domain at regular intervals** — DNS-based beaconing, a variant that avoids HTTP/TLS fingerprinting entirely.
- **A connection with beacon-rhythm regularity to a destination with no other legitimate traffic to that same host** from anywhere else in the environment.

## How to collect it

Zeek or equivalent network-monitoring tooling for JA3/JA4 computation at the point of TLS negotiation; Sysmon Events 17/18 for named pipes and Event 8 (CreateRemoteThread) for the process-injection side, both requiring explicit configuration to capture — see the [Sysmon deployment lesson](#/lesson/l1-11-sysmon-deployment). Tools built specifically for statistical beacon-rhythm detection (RITA and similar) score periodicity across large volumes of connection metadata even when jitter is deliberately applied to defeat naive interval-matching.

## ATT&CK mapping

Falls under [Application Layer Protocol (T1071)](https://attack.mitre.org/techniques/T1071/) for the network-disguise techniques and [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/) for the host-side execution — the same technique family covered in [Level 5](#/lesson/l5-05-injection-techniques), confirming these two layers of evidence (network fingerprint, host injection artifact) are describing the same underlying activity from two different vantage points.

## Sources

- MITRE ATT&CK — [T1071 Application Layer Protocol](https://attack.mitre.org/techniques/T1071/), [T1573 Encrypted Channel](https://attack.mitre.org/techniques/T1573/)
- [Salesforce JA3 — TLS client fingerprinting](https://github.com/salesforce/ja3) and the JA4+ successor suite
- [Microsoft Security Blog — command-and-control infrastructure tracking (MSTIC)](https://www.microsoft.com/en-us/security/blog/)
- SANS FOR572 — Advanced Network Forensics and Analysis
