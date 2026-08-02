# Artifact: Prefetch

## What it is / where it lives

Windows Prefetch is a performance feature, not a security feature — which is exactly why it's forensically valuable: the OS creates it automatically, with no intent to log anything, so it's hard for an attacker to know to avoid leaving a trace here.

- **Location:** `C:\Windows\Prefetch\*.pf`
- **Naming:** `EXECUTABLENAME-HASH.pf`, where `HASH` is derived from the full path the executable was launched from — the same binary launched from two different locations produces two different Prefetch files.
- **Retention:** the Prefetch folder isn't unlimited. Windows 8 and later retain up to 1,024 of these files; Windows 7 and earlier cap out at 128. Once full, the oldest entries get recycled out.
- **What's inside:** the modern format (Windows 8+) tracks up to eight separate execution timestamps in a single file, plus a run count and a list of files/directories the executable referenced in roughly its first ten seconds of activity — DLLs loaded, config files opened, sometimes arguments a script pulled in.

## Normal baseline

Every Windows client (workstation/laptop) should show Prefetch entries for common OS binaries, the organization's standard software (browsers, Office, the EDR agent itself), and IT-deployed tools. Windows Server historically ships with application-level prefetching either disabled or limited by default — check `HKLM\SYSTEM\CurrentControlSet\Control\SessionManager\MemoryManagement\PrefetchParameters\EnablePrefetcher` (0 = disabled, 1 = application-launch prefetching, 2 = boot prefetching, 3 = both) before assuming a sparse Prefetch folder on a server means something was hidden — it may just mean it was never enabled.

## Red flags

- A `.pf` file for a tool with no legitimate business purpose on that host: `mimikatz.exe`, `procdump.exe`, `psexec.exe` outside sanctioned admin workflows, `nc.exe` / `ncat.exe`.
- Multiple `.pf` files for the *same executable name* with *different hashes* — the same binary launched from several different paths, a common pattern when malware is staged and re-copied across directories.
- Execution from a path that shouldn't be executing anything: `%TEMP%`, `\AppData\Local\Temp\`, `\Downloads\`, a user's `Roaming` profile folder.
- A single, isolated execution of a tool that should either never run, or should run constantly.
- **Absence where presence is expected.** If Prefetch should be enabled on a host and the directory is sparse or the timestamps stop abruptly, treat anti-forensic activity (deliberate Prefetch clearing) as a live hypothesis, not just bad luck.

!!! success "Baseline"
    Entries matching known-deployed software, launched from expected paths, with run counts consistent with normal usage patterns.

!!! danger "Red flag"
    Known offensive tooling, execution from a temp/staging path, or split hashes for one executable name.

## How to collect it

Prefetch is a disk artifact — pull it during standard triage collection, not memory acquisition. Eric Zimmerman's `PECmd` is the de facto standard parser:

```
PECmd.exe -d C:\Windows\Prefetch --csv C:\triage\output
```

Run it against the whole directory rather than a single file, and export to CSV/JSON so results drop straight into a timeline tool. Collect Prefetch *before* running other live-response tooling on the host — every process you launch is itself creating or updating `.pf` files, and can push older, more relevant entries past the retention cap.

## ATT&CK mapping

Prefetch isn't a technique itself — it's a **data source** supporting detection of [T1204 (User Execution)](https://attack.mitre.org/techniques/T1204/) and, practically, any technique that involves running a binary. Deliberate clearing of Prefetch to hide execution evidence falls under [T1070 (Indicator Removal)](https://attack.mitre.org/techniques/T1070/).

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500: Windows Forensic Analysis)
- [SANS Internet Storm Center — Forensic Value of Prefetch](https://isc.sans.edu/diary/Forensic+Value+of+Prefetch/29168)
- [SANS — A Prescription for Windows Prefetch Analysis](https://www.sans.org/blog/a-prescription-for-windows-prefetch-analysis)
- Eric Zimmerman's forensic tools (PECmd)
