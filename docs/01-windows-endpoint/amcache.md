---
tags:
  - Windows Endpoint
  - T1204
---

# Artifact: Amcache

## What it is / where it lives

Amcache is a registry hive — not a "normal" registry hive loaded at boot, but a standalone `.hve` file — that catalogs executables Windows has seen on the system, including ones that have since been deleted.

- **Location:** `C:\Windows\AppCompat\Programs\Amcache.hve`
- **Format has changed across Windows versions.** Windows 7/8 use an older `Root\File` / `Root\Programs` structure. Windows 10 and 11 use a richer structure under `Root\InventoryApplication`, `Root\InventoryApplicationFile`, `Root\InventoryDriverBinary`, and `Root\InventoryApplicationShortcut`.
- **What's inside (modern format):** full executable path, file size, a **SHA-1 hash**, binary architecture (x86/x64), the compiler link timestamp, and — for entries tied to installed software — publisher and version metadata from `InventoryApplication`.

## Normal baseline

A healthy, long-lived Windows desktop accumulates thousands of `InventoryApplicationFile` records over its lifetime — OS binaries, installed software, and one-off utilities a user or admin has run, most tied back to a corresponding `InventoryApplication` install record.

## Red flags

- A `SHA-1` hash matching known-malicious binaries in threat-intel sources — Amcache is one of the only artifacts that preserves a cryptographic hash of a file *after it's been deleted*.
- An `InventoryApplicationFile` entry with **no** corresponding `InventoryApplication` record — the file was present and executed, but never went through a normal install process, consistent with a dropped/staged tool rather than legitimate software.
- Execution from a path with no business justification, paired with a `LinkDate` (compile timestamp) that's suspiciously fresh relative to when it appeared on the host.
- **Unusually clean data.** A hive with only a handful of entries and no orphaned file records doesn't match how a real, months-old Windows installation behaves — a genuine desktop accumulates thousands of scattered, imperfect records over its lifetime, so suspiciously tidy data is itself worth questioning.

!!! success "Baseline"
    A large, organically messy set of records matching known-installed software plus ordinary one-off tool usage, most tied to `InventoryApplication` entries.

!!! danger "Red flag"
    Known-bad SHA-1 hashes, orphaned `InventoryApplicationFile` entries with no install record, or a suspiciously sparse hive.

## How to collect it

Amcache.hve is normally locked while the OS is running — pull it from an offline image, a triage collection tool, or a Volume Shadow Copy. Parse with Eric Zimmerman's `AmcacheParser`:

```
AmcacheParser.exe -f C:\triage\Amcache.hve --csv C:\triage\output
```

!!! tip "One important limitation"
    The SHA-1 hash is only computed over the **first ~30 MB** of a file. For anything larger, the recorded hash won't match the file's true full-content hash — don't be surprised when a large binary's Amcache hash doesn't turn up a hit on VirusTotal.

Treat a lone Amcache hit as a starting point for further digging, not a finished conclusion — it becomes solid once corroborated by something like a matching [Prefetch](prefetch.md) entry or a Security 4688 process-creation event.

## ATT&CK mapping

Data source supporting [T1204 (User Execution)](https://attack.mitre.org/techniques/T1204/) and, via `InventoryDriverBinary`, driver-based persistence and rootkit investigation more broadly.

<!-- BACKLINKS:START -->
## Referenced From

- [Timeline Construction & Correlation](../00-foundations/timeline-construction.md)
- [Module 1: Windows Endpoint Forensics](index.md)
- [Artifact: Registry Hives](registry-hives.md)
- [Artifact: Shimcache (AppCompatCache)](shimcache.md)
- [The Entra Connect Server: A Target in Its Own Right](../06-cloud-identity/entra-connect-as-target.md)
- [Playbook: Domain Compromise / Lateral Movement](../08-playbooks/domain-compromise.md)
- [Playbook: Ransomware](../08-playbooks/ransomware.md)
- [Playbook: Web Shell / Server Compromise](../08-playbooks/web-shell-compromise.md)
- [File Carving](../anti-forensics/file-carving.md)
- [Drill: Prefetch Triage](../practice-drills/prefetch-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500 / FOR508 — execution-evidence artifacts)
- Eric Zimmerman's forensic tools (AmcacheParser)
