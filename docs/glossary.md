# Glossary

A single lookup point for the acronyms and terms used throughout this guide. Each entry links to the page that covers it in depth — this page defines, it doesn't re-teach.

**ADS (Alternate Data Stream)** — an NTFS feature allowing a file to carry additional, named, normally-invisible data streams. See [Alternate Data Streams](anti-forensics/alternate-data-streams.md).

**AIR (Automated Investigation and Remediation)** — Defender for Endpoint's capability to automatically investigate and, for high-confidence verdicts, remediate alerts. See [Automated Investigation & Remediation](07-defender-suite/automated-investigation-remediation.md).

**AMSI (Antimalware Scan Interface)** — the interface letting AV/EDR engines inspect script content immediately before execution, after any obfuscation has already been unwound. See [Evasion Detection](04-powershell-forensics/evasion-detection.md).

**AD CS (Active Directory Certificate Services)** — AD's built-in PKI; misconfigurations here (the "ESC" family) allow certificate-based authentication as another user. See [AD CS Abuse](02-active-directory/adcs-abuse.md).

**ATT&CK** — MITRE's knowledge base of adversary tactics and techniques, used throughout this guide as a tagging system. See [ATT&CK Primer](00-foundations/attack-primer.md).

**Body file** — a standardized intermediate format (MACtime) for filesystem timeline data, consumable by `plaso`. See [Timeline Construction & Correlation](00-foundations/timeline-construction.md).

**CLM (Constrained Language Mode)** — a PowerShell execution restriction blocking direct .NET/COM access, commonly paired with AppLocker/WDAC. See [Evasion Detection](04-powershell-forensics/evasion-detection.md).

**DCSync** — abuse of the AD replication protocol to request password hashes for any account without executing on a Domain Controller. See [DCSync Detection](02-active-directory/dcsync-detection.md).

**DGA (Domain Generation Algorithm)** — malware technique generating many candidate C2 domains algorithmically to defeat static blocklisting. See [DNS Analysis](network-analysis/dns-analysis.md).

**DKOM (Direct Kernel Object Manipulation)** — a rootkit technique unlinking a process from the OS's own tracking structures to hide it from list-based enumeration. See [Process Analysis](03-memory-forensics/volatility-process-analysis.md).

**EPROCESS** — the Windows kernel structure representing a running process. See [EPROCESS Internals](03-memory-forensics/eprocess-internals.md).

**ESC1 / ESC4 / ESC8** — specific AD CS misconfiguration classes enabling certificate-based privilege escalation. See [AD CS Abuse](02-active-directory/adcs-abuse.md).

**ETHREAD** — the kernel structure representing a thread; its start address is the key forensic field. See [Thread Analysis](03-memory-forensics/thread-analysis.md).

**EVTX** — the Windows Event Log file format. See [Event Log Key IDs Reference](01-windows-endpoint/event-log-key-ids.md) and, for recovery after tampering, [Log & Artifact Recovery](anti-forensics/log-artifact-recovery.md).

**FILETIME** — the underlying Windows timestamp format: 100-nanosecond intervals since January 1, 1601 UTC. See [Timeline Construction & Correlation](00-foundations/timeline-construction.md).

**gMSA (Group Managed Service Account)** — a service account type with automatically-rotated, unknowable passwords, recommended for high-privilege service accounts. Referenced in [Kerberoasting](02-active-directory/kerberoasting.md) mitigations and [Entra Connect as Target](06-cloud-identity/entra-connect-as-target.md).

**IOC (Indicator of Compromise)** — a specific, low-durability artifact of an attack (a hash, domain, IP). See [Pyramid of Pain](00-foundations/pyramid-of-pain.md) for why these rank lowest in detection value.

**JA3 / JA4** — TLS client fingerprinting techniques; JA3 is now considered unreliable against modern browsers, JA4 is current. See [Proxy & Firewall Log Triage](network-analysis/proxy-firewall-triage.md).

**KQL (Kusto Query Language)** — the query language used in Defender XDR's Advanced Hunting. See [Advanced Hunting with KQL](07-defender-suite/advanced-hunting-kql.md).

**LOLBin (Living-off-the-Land Binary)** — a legitimate, signed Windows binary abused for malicious purposes (e.g., `rundll32.exe`, `comsvcs.dll`). See [LSASS Memory Analysis](03-memory-forensics/lsass-memory-analysis.md).

**MDE (Microsoft Defender for Endpoint)** — the cloud-backed EDR component of the Defender suite, formerly Windows Defender ATP. See [Microsoft Defender Suite](07-defender-suite/index.md).

**MDI (Microsoft Defender for Identity)** — monitors on-prem AD signals for identity attacks. See [Defender for Identity Mapping](07-defender-suite/defender-for-identity-mapping.md).

**MFT (Master File Table)** — the NTFS structure indexing every file and directory on a volume. See [$MFT & Timestomping](01-windows-endpoint/mft.md).

**NRT (Near Real-Time)** — a Defender custom detection rule frequency running continuously rather than on a fixed schedule. See [Detection Engineering](07-defender-suite/detection-engineering.md).

**NTLM relay** — forwarding a captured NTLM authentication attempt to a different service to authenticate as the victim, without cracking the credential. Referenced in [AD CS Abuse](02-active-directory/adcs-abuse.md) (ESC8).

**PICERL** — SANS's six-phase incident response model: Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned. See [IR Lifecycle](00-foundations/ir-lifecycle.md).

**Plaso / log2timeline** — the standard tool for merging multiple artifact sources into one normalized "super timeline." See [Timeline Construction & Correlation](00-foundations/timeline-construction.md).

**PPL (Protected Process Light)** — a Windows protection mechanism that, applied to `lsass.exe`, raises the bar against direct memory-read credential theft. See [LSASS Memory Analysis](03-memory-forensics/lsass-memory-analysis.md).

**Shimcache / AppCompatCache** — a registry-based cache of executables Windows evaluated for compatibility shimming; proves presence, not confirmed execution, on Windows 10/11. See [Shimcache](01-windows-endpoint/shimcache.md).

**SSP (Security Support Provider)** — a DLL loaded into `lsass.exe` to handle an authentication package; a rogue SSP is a durable credential-theft persistence mechanism. See [LSA Provider / SSP Abuse](05-persistence/lsa-ssp.md).

**TGT / TGS** — Kerberos Ticket Granting Ticket / Ticket Granting Service ticket. See [Golden Ticket & Silver Ticket Indicators](02-active-directory/golden-silver-ticket.md).

**TTP (Tactics, Techniques, and Procedures)** — the highest-durability level of threat intelligence, per the [Pyramid of Pain](00-foundations/pyramid-of-pain.md).

**UAL (Unified Audit Log)** — Microsoft Purview's cross-workload audit log, with meaningfully longer retention but real ingestion latency compared to Entra ID's native logs. See [Sign-In Logs vs. Audit Logs](06-cloud-identity/sign-in-vs-audit-logs.md).

**VAD (Virtual Address Descriptor)** — the structure describing a process's memory regions and their permissions; what `vadinfo`/`malfind` actually read. See [Injected Code Detection](03-memory-forensics/injected-code-detection.md).

**VSS (Volume Shadow Copy Service)** — Windows' point-in-time volume snapshot mechanism, useful for recovering pre-tampering data. See [Volume Shadow Copy Recovery](anti-forensics/volume-shadow-copy-recovery.md).

**XDR (Extended Detection and Response)** — Microsoft's cross-product correlation layer unifying Defender for Endpoint, Identity, Office 365, and Cloud Apps. See [Microsoft Defender Suite](07-defender-suite/index.md).

**Zone.Identifier** — the alternate data stream Windows automatically writes to downloaded files (the "Mark of the Web"), recording download origin. See [Alternate Data Streams](anti-forensics/alternate-data-streams.md).

<!-- BACKLINKS:START -->
## Referenced From

- [Enterprise DFIR Field Guide](index.md)

<!-- BACKLINKS:END -->

