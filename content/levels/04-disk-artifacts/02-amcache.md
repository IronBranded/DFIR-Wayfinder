Amcache is the only Windows execution-adjacent artifact that stores a **file hash**. That single property makes it disproportionately useful: it survives deletion of the binary, and it gives you something to pivot on against threat intelligence when all you have left is a path and a memory of something suspicious.

## Where it lives

```
C:\Windows\AppCompat\Programs\Amcache.hve
```

It is a registry hive file, but not one loaded into the live registry under a normal hive path — it is parsed as a standalone file. The key that matters most is **`InventoryApplicationFile`**, holding per-file entries with:

- **Full path** of the binary
- **SHA-1 hash** of the file
- **File size**, **version**, **publisher**, and **PE link date** (compile timestamp)

## What populates it, and why that matters

Amcache is written by the **Microsoft Compatibility Appraiser**, a scheduled task that inventories software on the system. This is the crucial nuance for interpretation:

> [!IMPORTANT]
> Amcache is an **inventory of files that were present**, not a log of files that were executed. The appraiser records binaries it finds, which can include files that never ran. An Amcache entry establishes presence and identity; it does not by itself establish execution.

Because a scheduled task drives it, there is also a **timing lag**. A binary that ran ten minutes ago may not appear in Amcache yet, while [Prefetch](#/lesson/l4-01-prefetch) recorded it immediately. That lag is not a contradiction — it is expected behaviour, and knowing it prevents a wrong conclusion.

## Reading the trio together

The real technique across [Prefetch](#/lesson/l4-01-prefetch), Amcache, and [ShimCache](#/lesson/l4-03-shimcache) is reconciling their disagreements:

| Observation | Most likely meaning |
|---|---|
| Prefetch present, Amcache absent | Ran recently; the appraiser has not inventoried it yet |
| Amcache present, Prefetch absent | Present on disk but possibly never ran — or Prefetch is disabled (server) or was deleted |
| Amcache present, file gone from disk | Binary deleted after inventory — the SHA-1 survives it |
| All three absent, but execution suspected | Check whether Prefetch is disabled, whether ShimCache is still in memory, and whether anti-forensic deletion occurred |

None of these is conclusive alone. Together they usually resolve to a defensible statement.

## Normal baseline

Entries correspond to installed software in Program Files and System32, with publisher and version fields populated and consistent. Hashes match known-good references for Microsoft and vendor binaries.

## Red flags

- **An entry for a path under `%TEMP%`, `%APPDATA%`, or `C:\Users\Public`.**
- **A SHA-1 matching a known-bad sample**, which is the pivot this artifact uniquely enables.
- **Missing or inconsistent publisher/version metadata** on a binary claiming to be from a major vendor.
- **A PE link date far in the future or implausibly old** — compile-timestamp manipulation, a common packing and anti-analysis tell.
- **An entry for a binary that no longer exists**, especially one whose path was never a legitimate install location.

## How to collect it

**AmcacheParser** (Eric Zimmerman) is the standard tool and handles the format differences between Windows versions, which are significant enough that generic hive parsers produce incomplete results. Copy `Amcache.hve` (plus its transaction logs, `.LOG1`/`.LOG2`, which may contain unflushed entries) rather than parsing in place. Feed the resulting SHA-1 values to whatever threat-intelligence source you use.

## ATT&CK mapping

Evidence-source content rather than a technique. Compile-timestamp manipulation maps to [Indicator Removal (T1070)](https://attack.mitre.org/techniques/T1070/).

## Sources

- [Eric Zimmerman's tools — AmcacheParser](https://ericzimmerman.github.io/)
- 13cubed — Amcache analysis (YouTube)
- SANS FOR500 — Windows Forensic Analysis
