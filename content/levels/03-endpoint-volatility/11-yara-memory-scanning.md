[Injected code detection](#/lesson/l3-05-injected-code-detection) finds memory that *looks* wrong structurally — private, executable, unbacked. This lesson covers finding memory that matches something you already know, and the plugins that detect tampering `malfind` does not.

## YARA in one paragraph

A YARA rule describes byte patterns, strings, and conditions that identify a family of files or memory regions. It is the standard way to express "this looks like Cobalt Strike" or "this contains the config block that family uses" in a form tooling can execute.

```
rule Suspicious_Cradle_In_Memory
{
    strings:
        $a = "DownloadString" wide ascii
        $b = "FromBase64String" wide ascii
        $c = "amsiInitFailed" wide ascii
    condition:
        2 of them
}
```

`wide ascii` matters in memory: .NET and PowerShell hold strings as UTF-16, so a rule matching only ASCII misses them — the same UTF-16LE property behind [encoded command decoding](#/lesson/l3-14-powershell-obfuscation).

## Scanning memory with it

```
vol -f <image> windows.vadyarascan --yara-file rules.yar
vol -f <image> yarascan.YaraScan --yara-file rules.yar
```

Scanning a memory image rather than disk is what makes this work against [fileless payloads](#/lesson/l3-16-powershell-malicious-patterns). A reflectively-loaded assembly never existed as a file for a disk scan to examine, but its strings are in memory, and a rule matching them finds it.

**Where the rules come from:** vendor and community rule sets ship with most malware-analysis distributions; many threat-intelligence reports publish rules alongside indicators. Writing bespoke rules for a specific incident — matching a C2 address, a mutex name, a distinctive config string recovered during triage — is often more valuable than any public set, because it is tuned to what you actually found.

## Rootkit and tampering plugins

`malfind` finds injected regions. These find modifications to the system's own structures:

| Plugin | Detects |
|---|---|
| `windows.ssdt` | System Service Descriptor Table hooking — kernel call table entries redirected |
| `windows.modules` / `windows.modscan` | Loaded kernel modules by list vs. by pool scan — the [`pslist`/`psscan` logic](#/lesson/l3-03-eprocess-internals) applied to drivers |
| `windows.driverirp` | Driver IRP handler tables pointing outside the owning driver |
| `windows.callbacks` | Registered kernel notification callbacks, a common rootkit and EDR-blinding surface |
| `windows.svcscan` | Services enumerated from memory, catching entries hidden from the registry |

The `modules` versus `modscan` pair is the same technique as `pslist` versus `psscan`: one walks a linked list, the other scans for pool tags, and a driver present in the scan but absent from the list is unlinked — the [BYOVD](#/lesson/l5-15-byovd-loldrivers) and kernel-tampering signature from the endpoint side.

> [!IMPORTANT]
> Two plugins frequently cited in older material — **`apihooks`** (inline and IAT hook detection) and **`hollowfind`** (a process-hollowing-specific community plugin) — are **Volatility 2** and have no direct Volatility 3 equivalent. Their functionality is partly covered by `malfind`, `ldrmodules`, and the VAD comparison in [injected code detection](#/lesson/l3-05-injected-code-detection). If a reference or exam objective names them, that is why they will not appear in a Volatility 3 plugin list.

## Pagefile and swapfile

```
C:\pagefile.sys       C:\swapfile.sys
```

Memory paged out to disk holds the same content as RAM — decrypted data, injected code, credential material — and **survives a reboot**, unlike RAM itself. It is not parseable as a memory image on its own (no structure, just paged blocks) but it is directly scannable with YARA and carvable with `bulk_extractor` and `strings`.

> [!TIP]
> Worth collecting whenever memory is collected, and worth collecting *even when memory acquisition failed or was never done*. A machine rebooted before anyone responded still has a pagefile containing fragments of what was resident before the reboot.

## Normal baseline

YARA scans of a clean image return matches only from expected security tooling and legitimate software carrying flagged strings. Module list and module scan agree. SSDT entries point into `ntoskrnl`. Registered callbacks belong to identifiable, signed drivers.

## Red flags

- **A YARA match in a process with no legitimate reason to contain that content**, particularly matches on C2 configuration or offensive-framework strings.
- **A driver in `modscan` absent from `modules`** — an unlinked kernel module.
- **SSDT entries pointing outside `ntoskrnl`**, or IRP handlers pointing outside their owning driver.
- **A service visible via `svcscan` in memory but absent from the registry hive.**
- **YARA matches in the pagefile with no corresponding match in RAM** — evidence of something that ran before the current boot.

## How to collect it

Run YARA scanning after the [standard triage sequence](#/lesson/l3-17-malware-triage-methodology), not instead of it — structural detection first, signature matching second, because signatures only find what someone has already described. Acquire `pagefile.sys` and `swapfile.sys` alongside the memory image; both are locked on a live system and require forensic or shadow-copy access.

## ATT&CK mapping

Supports detection of [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/), [Rootkit (T1014)](https://attack.mitre.org/techniques/T1014/), and [Reflective Code Loading (T1620)](https://attack.mitre.org/techniques/T1620/).

## Sources

- [YARA documentation](https://yara.readthedocs.io/)
- [Volatility 3 — Windows plugin documentation](https://volatility3.readthedocs.io/en/latest/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
