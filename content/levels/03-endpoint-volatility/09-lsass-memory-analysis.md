LSASS — the Local Security Authority Subsystem Service — is where Windows holds live credential material in memory for every active session on a system. That single fact is why this academy keeps returning to it from different directions: [Pass-the-Hash](#/lesson/l7-07-pass-the-hash-pass-the-ticket) assumes the reader already understands what's being stolen, and [the ASR lesson](#/lesson/l2-06-attack-surface-reduction) covers a rule that exists purely to block access to it. This lesson is where that thread finally gets its own full treatment.

## What's actually sitting in LSASS memory

**NTLM hashes** for currently logged-on accounts. **Kerberos tickets** — both TGTs and service tickets — cached for the current session's authentication needs. And, under specific legacy or misconfigured conditions, **WDigest-cached plaintext-recoverable credentials**: WDigest is a legacy authentication protocol that historically cached passwords in a plaintext-recoverable form specifically to support its own authentication scheme. Microsoft disabled that caching by default starting with Windows 8.1/Server 2012 R2, but it can be **re-enabled** via the registry (`HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest\UseLogonCredential` set to `1`) — checking whether it's been re-enabled is itself worth doing on any system under investigation.

## Dumping methods worth recognizing by name

**Mimikatz**'s `sekurlsa::logonpasswords` is the best-known tool, reading LSASS memory directly and parsing credential material out of it. **ProcDump** (`procdump.exe -ma lsass.exe <output>`) is a legitimate Sysinternals tool commonly repurposed for exactly this. **Task Manager's own "Create dump file" right-click option** on the Details tab requires no external tooling at all — a fully built-in Windows GUI action that produces a usable LSASS dump. And `rundll32.exe comsvcs.dll, MiniDump <PID> <path> full` is the LOLBin-flavored variant already covered in [Level 2's LOLBins lesson](#/lesson/l5-14-lolbins) — the same pattern of a legitimate, signed Windows DLL exposing a function never intended for this use, abused to the same end.

## Why "LSASS was touched" is the wrong question

LSASS is accessed constantly by completely ordinary system components as part of normal Windows operation — treating any access at all as suspicious produces overwhelming noise. What actually distinguishes credential theft is the **kind** of access requested, not whether access happened. Sysmon Event ID 10 (ProcessAccess) records a `GrantedAccess` value describing exactly what rights a process obtained when opening a handle to another process — a routine status query looks nothing like the broad, memory-reading access a dumping tool needs to actually extract credential material, and that distinction is what separates a real finding from background noise.

## Mitigations that change what's even possible

**LSA Protection (RunAsPPL)** makes LSASS a Protected Process Light — ordinary usermode code, even running as SYSTEM, cannot open a full-access handle to it without a signed, Microsoft-trusted driver, which is exactly why [BYOVD](#/lesson/l5-15-byovd-loldrivers) exists as an attacker response to this specific control. **Credential Guard** goes further still, isolating credential material inside a separate, hardware-virtualized memory space that's inaccessible even to the kernel itself, not just to usermode.

## Normal baseline

LSA Protection enabled fleet-wide as a current, standard Microsoft-recommended hardening baseline; Credential Guard enabled wherever hardware and licensing support it; routine LSASS access from legitimate system processes (`services.exe`, `winlogon.exe`, and similar) staying at query-level rights rather than the broader access a memory dump requires.

## Red flags

- **Any process requesting memory-read-level access to LSASS** outside a documented, expected security-tooling context.
- **The specific dump-method command patterns above** — `procdump -ma lsass.exe`, `comsvcs.dll, MiniDump`, or Mimikatz-style command lines — appearing in process-creation or command-line logs.
- **A Sysmon Event ID 10 ProcessAccess entry targeting `lsass.exe`** from a process with no documented reason to be accessing it at all.
- **LSA Protection or Credential Guard found disabled** on a host where policy says either should be enabled.
- **WDigest credential caching found re-enabled** via the registry key above, on a system where it should be off by default.

## How to collect it

On disk: check for an actual LSASS dump file left behind by any of the tools above — often the single most directly actionable artifact, since it's the finished product of a successful attempt rather than something requiring live memory analysis. Live: `Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name RunAsPPL` confirms LSA Protection status directly. In an acquired memory image: `windows.pslist` to confirm `lsass.exe`'s PID and parent (per [process analysis](#/lesson/l3-02-volatility-process-analysis)), cross-referenced against Sysmon's Event ID 10 log for any process that obtained a handle to it.

## ATT&CK mapping

Maps directly to [OS Credential Dumping: LSASS Memory (T1003.001)](https://attack.mitre.org/techniques/T1003/001/) — one of the most consistently observed credential-access techniques across real-world intrusions, and the reason this academy treats it as a recurring thread rather than a single, isolated lesson.

> [!TIP]
> [The next lesson](#/lesson/l3-10-network-memory-artifacts) shifts from credentials to connections — what's still recoverable about a network session in memory, even after the connection itself has already closed.

## Sources

- [Microsoft Learn — Configuring Additional LSA Protection](https://learn.microsoft.com/en-us/windows-server/security/credentials-protection-and-management/configuring-additional-lsa-protection)
- [Microsoft Learn — Credential Guard](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/)
- MITRE ATT&CK — T1003.001: OS Credential Dumping: LSASS Memory
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
- Windows Internals (Russinovich, Solomon, Ionescu) — LSA, logon sessions, and protected processes
