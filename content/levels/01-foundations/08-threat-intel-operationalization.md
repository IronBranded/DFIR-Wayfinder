Most threat intelligence programs fail in the same specific way: indicators arrive, land in a repository, and nothing about what the organization detects or blocks changes. The test for whether intelligence is operational is narrow — **what happens differently today because this arrived?**

## Three levels, unevenly consumed

**Strategic** — trends, sector targeting, actor motivations. Audience is leadership; output is budget and priority decisions.

**Operational** — campaigns, TTPs, tooling. Audience is detection engineering; output is [detection rules](#/lesson/l6-10-detection-engineering).

**Tactical** — indicators: hashes, IPs, domains. Audience is automated controls; output is blocklists and watchlists.

Most organizations consume tactical almost exclusively, because it is the easiest to ingest. It is also the **least durable** — [the Pyramid of Pain](#/lesson/l1-04-pyramid-of-pain) places hashes and IPs at the bottom precisely because an adversary discards them without effort. Operational intelligence produces detections that survive; tactical intelligence produces detections that expire.

## Five things that make it operational

**1. Ingest into something that acts.** An indicator in a PDF is not operational. The same indicator in an EDR custom indicator list, a SIEM watchlist, or a proxy blocklist is.

**2. Search backwards, not just forwards.** A new indicator should trigger a **retrospective hunt** across historical telemetry, not merely start matching from today. The most valuable question a new indicator answers is usually "were we already hit?" — and only a backward search answers it.

**3. Prioritize by relevance.** A feed covering every threat to every sector is mostly noise for any single organization. Filter by sector, geography, and technology stack before ingesting, or the volume trains people to ignore the source.

**4. Age indicators deliberately.** IP addresses get reassigned. A malicious IP from eighteen months ago is now, with high probability, someone else's legitimate infrastructure. Without an aging policy, an intel program slowly accumulates false positives against innocent third parties — and erodes trust in every alert it generates.

**5. Close the loop.** Measure what the intelligence actually caught. A feed that has never produced a true positive is a subscription, not a capability.

## Formats

**STIX** structures intelligence; **TAXII** transports it. **MISP** is the widely-used open-source platform for storing, correlating, and sharing indicators, including within sector-specific sharing communities where the relevance filtering in point 3 comes for free.

## Red flags in your own program

- **Indicators arriving but no corresponding change** in any detection or blocking control.
- **No retrospective search** when a new indicator is ingested.
- **No aging or decay policy** — indicators accumulate indefinitely.
- **A feed with no measured true positives**, retained because cancelling it feels risky.
- **Intelligence consumed entirely at the tactical level**, with no operational content reaching detection engineering.

## Sources

- [OASIS — STIX/TAXII](https://oasis-open.github.io/cti-documentation/)
- [MISP](https://www.misp-project.org/)
- MITRE ATT&CK
