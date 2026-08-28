The previous lesson covered obfuscation — hiding *what* a command says. This one covers evasion — stopping the command from being scanned or logged *at all*. They're different threat models, and a script can use either, both, or neither.

## AMSI: what changed, and what it doesn't cover

The **Antimalware Scan Interface (AMSI)** is a Windows interface that lets an installed antivirus/EDR product inspect script content — PowerShell, VBA macros, Windows Script Host, and more — immediately before it executes, even if that content was generated dynamically at runtime and never touched disk as a file. It closed a real gap: before AMSI, a security product could scan a `.ps1` file on disk, but had no reliable way to inspect a script block built and run entirely in memory.

> [!PLAIN]
> Think of AMSI as a checkpoint PowerShell itself calls out to, right before running a piece of code — "here's what I'm about to execute, does anything recognize this as bad?" — rather than a scan of files sitting at rest.

## AMSI bypass patterns worth recognizing

A well-known category of bypass works by reaching into PowerShell's own .NET internals through reflection and disabling AMSI's initialization for the current session — commonly by locating the non-public `amsiInitFailed` field on the internal `System.Management.Automation.AmsiUtils` class and forcing it to `$true`, which causes PowerShell to treat AMSI as already broken and skip calling it. If you see reflection code in a decoded script block reaching for `AmsiUtils` or `amsiInitFailed` by name, that's this pattern — worth flagging directly rather than needing to reverse-engineer what it does from scratch, the same way this academy treats the [Squiblydoo `regsvr32` pattern](#/lesson/l2-12-lolbins) as a named, recognizable shape rather than something to work out fresh every time.

> [!WARNING]
> The point of recognizing this pattern is detection, not reproduction. Specific bypass techniques age quickly as Microsoft patches them — the durable skill is knowing the *shape* (reflection reaching into AMSI's own internals) well enough to flag a variant you haven't seen named before.

## Downgrade attacks

AMSI and Script Block Logging were both added well after PowerShell's early versions existed. **PowerShell 2.0**, still present as an optional Windows feature on many systems for legacy compatibility, predates both entirely — so explicitly invoking it (`powershell -version 2`) sidesteps AMSI scanning and most modern logging in one step, without needing to defeat either directly.

## The Execution Policy misconception

`-ExecutionPolicy Bypass` shows up constantly in both legitimate scripts and malicious ones, and it's worth being precise about what it actually does: PowerShell's execution policy is a convenience/safety feature that controls whether *scripts* (as opposed to interactive commands) require a digital signature or a confirmation prompt to run — it is explicitly **not** a security boundary, and Microsoft's own documentation says so directly. Seeing `-ExecutionPolicy Bypass` tells you someone didn't want a prompt; it doesn't by itself tell you anything about intent.

## Constrained Language Mode

**Constrained Language Mode (CLM)**, enforced through WDAC/AppLocker policy, is an actual hardening control — it blocks access to .NET reflection, COM objects, `Add-Type`, and other capabilities many of the techniques above depend on. In an environment where CLM is the expected policy, a PowerShell session running in **Full Language Mode** instead is itself worth investigating, since it suggests either a policy gap or an active bypass attempt.

## Normal baseline

Most legitimate administrative and deployment tooling has no need to bypass AMSI or invoke the PowerShell 2.0 engine — those are narrow, specific actions. `-ExecutionPolicy Bypass`, on the other hand, is genuinely common in benign scripts (often more from habit or a copy-pasted deployment guide than any real necessity), so treat it as a mild hygiene signal rather than a definitive red flag on its own, and weigh it alongside everything else in the same script block.

## Red flags

- **A decoded script block containing reflection calls that reference `AmsiUtils` or `amsiInitFailed` by name.**
- **`powershell -version 2` invoked on a host where the PowerShell 2.0 optional feature shouldn't normally be exercised** — a strong, specific signal, unlike `-ExecutionPolicy Bypass` alone.
- **Full Language Mode observed where Constrained Language Mode is the documented, expected policy** for that host or account.
- **A 4103 module-logging event with no matching 4104 script-block event in the same window**, immediately following other suspicious activity — logging present at one layer and silent at another is a pattern worth its own line item, not just background noise.

## How to collect it

`$ExecutionContext.SessionState.LanguageMode` run live on a still-active session shows the current language mode directly. AMSI-related detections, when a security product does catch a bypass attempt, typically surface in that product's own event log — for Microsoft Defender specifically, the `Microsoft-Windows-Windows Defender/Operational` channel, covered in Level 6. The reflection code itself is only visible through the [Script Block Logging event (4104)](#/lesson/l3-01-powershell-logging) — process-creation logging alone won't show script internals.

## ATT&CK mapping

Maps to [Impair Defenses: Disable or Modify Tools (T1562.001)](https://attack.mitre.org/techniques/T1562/001/) for AMSI bypass and language-mode evasion specifically, sitting alongside [PowerShell (T1059.001)](https://attack.mitre.org/techniques/T1059/001/) as the execution technique being shielded.

> [!TIP]
> Whatever evasion technique produced the script block, [the previous lesson](#/lesson/l3-02-powershell-obfuscation) is what actually gets you from an unreadable payload to readable text once you have it in hand.

## Sources

- [Microsoft Learn — Antimalware Scan Interface (AMSI)](https://learn.microsoft.com/en-us/windows/win32/amsi/antimalware-scan-interface-portal)
- [Microsoft Learn — about Execution Policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)
- [Microsoft Learn — about Language Modes](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_language_modes)
