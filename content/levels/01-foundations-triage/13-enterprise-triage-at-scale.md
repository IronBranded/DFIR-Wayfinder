Everything else in this academy assumes you already have the evidence. This lesson is about the step before that, and it is the one that breaks first in a real incident: **you have a hypothesis and four thousand endpoints, and imaging them is not an option.**

## The shift in question

Single-host forensics asks *what happened on this machine*. Enterprise triage asks *which machines does this apply to* — and answers it by collecting a small, targeted artifact set from many hosts rather than everything from one.

That inverts the collection strategy. You are not acquiring disks; you are running a defined query fleet-wide, getting back kilobytes per host, and using the result to decide which handful of machines actually warrant deep analysis.

## The tooling, by shape

**KAPE** (Kroll Artifact Parser and Extractor) — the standard for **targeted collection**. Targets define what to collect (registry hives, event logs, `$MFT`, Prefetch, browser data); Modules define what to run against it. A KAPE triage collection pulls the artifact set this academy uses in minutes and a few hundred megabytes, rather than hours and a full disk image. Deployable per-host or pushed across a fleet.

**Kansa** — a PowerShell framework built specifically for **fleet-wide sweeps** using PowerShell Remoting. It runs a collection module against thousands of hosts in parallel and returns structured output ready for analysis. Its real strength is the analysis half: Kansa ships **frequency analysis** scripts that stack results across the estate and surface the outliers.

**Velociraptor** — an open-source endpoint visibility platform using its own query language (VQL) to hunt across endpoints in real time. Where KAPE collects and Kansa sweeps, Velociraptor maintains a persistent agent and answers arbitrary questions continuously, including scheduled hunts.

**F-Response** — mounts remote systems' disks and memory as read-only local volumes over the network, so existing forensic tools work against a live remote host without deploying anything analytical to it.

**osquery** — exposes the OS as a relational database queryable with SQL, useful for standing inventory and state questions across mixed platforms.

## Stacking: the technique that makes scale useful

The reason to collect from four thousand hosts is not to read four thousand results. It is **frequency analysis**, also called stacking:

> Collect one artifact type across the fleet. Aggregate identical values. Sort by count. **Look at the bottom.**

A service running on 3,847 machines is infrastructure. A service running on 3 is either niche software or the thing you are looking for. This works without any prior signature, without threat intelligence, and against tooling nobody has ever seen — which is precisely the case where signature-based detection fails.

It is the same reasoning as the prevalence hunting in [KQL Advanced Hunting](#/lesson/l1-14-advanced-hunting-kql), applied through collection tooling rather than an EDR platform, and it works in environments with no EDR at all.

> [!TIP]
> Stack the artifacts this academy already teaches: services, scheduled tasks, autorun entries, loaded drivers, listening ports, running process names and paths. Each stacks well because a healthy estate is overwhelmingly homogeneous — and homogeneity is what makes an outlier visible.

## Sequencing against volatility

Fleet collection is not exempt from [order of volatility](#/lesson/l1-02-order-of-volatility). On any host that triage identifies as compromised, memory comes before the triage package is re-run, and short-retention logs are pulled centrally in parallel rather than after scoping completes.

## Normal baseline

A tested, documented collection package exists and has been run against the estate at least once outside an incident — so that a baseline for stacking already exists, and so that deployment problems are discovered in advance rather than at hour two of a response. Remote collection paths (PowerShell Remoting, an EDR's live-response, or an agent) are known to work on every host class, including servers and isolated segments.

## Red flags in your own readiness

- **No tested fleet-collection capability** — the discovery that PowerShell Remoting is disabled fleet-wide should not happen during an incident.
- **No baseline collection**, meaning the first stack has nothing to compare against.
- **Collection that requires local admin credentials sprayed across the estate**, which recreates the exact credential-exposure problem [Level 4](#/lesson/l7-07-pass-the-hash-pass-the-ticket) is about.
- **A triage package so large it cannot practically be run fleet-wide** — targeted means targeted.

## ATT&CK mapping

This is defensive collection methodology rather than an attacker technique. It supports detection across every tactic by making the artifacts in Levels 2 through 7 collectable at a scale where [stacking](#/lesson/l1-04-pyramid-of-pain) becomes possible.

## Sources

- [KAPE — Kroll Artifact Parser and Extractor](https://www.kroll.com/kape)
- [Kansa — PowerShell incident response framework](https://github.com/davehull/Kansa)
- [Velociraptor — endpoint visibility and collection](https://docs.velociraptor.app/)
- [osquery](https://osquery.io/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
