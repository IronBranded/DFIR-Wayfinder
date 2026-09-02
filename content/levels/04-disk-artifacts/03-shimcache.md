ShimCache is the artifact most often misread in reports, and the misreadings are consistent enough to be worth naming up front: it is treated as execution evidence when it is not, and its timestamp is read as an execution time when it is not that either.

## What it is for

The Application Compatibility Cache exists so Windows can decide quickly whether a binary needs a compatibility shim applied. It records a small amount of metadata about files the shim engine has examined, stored in the registry:

```
HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\AppCompatCache
```

## Three things that change how you read it

**1. The timestamp is the file's last-modified time, not an execution time.** ShimCache stores the file's `$STANDARD_INFORMATION` modified timestamp — the same value [timestomping manipulates](#/lesson/l4-05-mft-timestomping). It tells you when the file was last written, not when it ran, and it inherits every weakness of `$SI` timestamps.

**2. On modern Windows there is no reliable execution flag.** Older versions carried an insertion flag that indicated execution. Windows 10 and later do not, and entries can be created when the shim engine examines a file for reasons other than execution — including a user browsing a folder in Explorer. **Presence in ShimCache means the file was present and was examined; it does not establish that it ran.**

**3. The registry value is written at shutdown.** The cache is maintained in kernel memory and flushed to the registry when the system shuts down. On a machine that has been running since before the activity you care about, **the relevant entries are not in the registry yet** — they exist only in memory, which makes [memory analysis](#/lesson/l3-01-acquisition) the only route to them until the host reboots.

> [!WARNING]
> The shutdown-flush behaviour has a practical trap: an investigator who reboots a host to collect an image destroys nothing, but an investigator who pulls the registry from a *live* system and finds no entry for a binary may conclude it was never present, when the entry is simply still in memory. Collect memory before rebooting, and note which side of a reboot your registry data came from.

## Structure

Entries are ordered **most-recent-first** and capped at roughly 1,024, with older entries evicted. That ordering is itself evidence: position in the list establishes relative recency between entries even where timestamps are unreliable or manipulated.

## Normal baseline

Entries correspond to executables present on the system, with modified timestamps matching their installation or patch dates. The list is dominated by Microsoft and installed-vendor binaries. Ordering broadly tracks recent system activity.

## Red flags

- **An entry for a path under `%TEMP%`, `%APPDATA%`, or `C:\Users\Public`** — the file was present and examined, which is worth pursuing even without execution proof.
- **An entry for a binary no longer on disk** — evidence of presence that survives deletion of the file itself.
- **An entry near the top of the ordering** (recent) for a suspicious path, corroborated against [Prefetch](#/lesson/l4-01-prefetch) or [Amcache](#/lesson/l4-02-amcache).
- **A modified timestamp inconsistent with the file's other MACB values** — potential timestomping, cross-checked in [the MFT lesson](#/lesson/l4-05-mft-timestomping).

## How to collect it

**AppCompatCacheParser** (Eric Zimmerman) parses the value from a live system or an offline `SYSTEM` hive, preserving the ordering. When working offline, read the ControlSet that was actually live at boot rather than assuming `ControlSet001`. Where the host has not rebooted since the activity of interest, extract the cache from memory instead.

## ATT&CK mapping

Evidence-source content rather than a technique.

> [!TIP]
> The one-line summary worth carrying: **ShimCache proves presence, not execution, and its timestamp describes the file, not the run.** Stated that way in a report, it is accurate and defensible. Stated as "the binary executed at this time," it is neither.

## Sources

- [Eric Zimmerman's tools — AppCompatCacheParser](https://ericzimmerman.github.io/)
- 13cubed — ShimCache and Amcache analysis (YouTube)
- SANS FOR500 — Windows Forensic Analysis
