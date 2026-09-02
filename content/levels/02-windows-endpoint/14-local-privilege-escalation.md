Everything in [Level 4](#/lesson/l4-01-ntds-dit) assumes an attacker already has *some* meaningful position — enough to touch AD, enough to run DCSync, enough to abuse delegation. This lesson covers what happens on a single host before any of that: turning a low-privilege foothold into local SYSTEM, without ever touching the domain.

## Unquoted service paths

A classic, still-surprisingly-common misconfiguration. If a service's executable path contains a space and isn't wrapped in quotes — `C:\Program Files\My App\service.exe` instead of `"C:\Program Files\My App\service.exe"` — Windows tries each space-delimited segment as a potential executable in turn: `C:\Program.exe`, then `C:\Program Files\My.exe`, before finally trying the real path. An attacker with write access to any of those earlier directories can drop a malicious binary at one of those intermediate paths, and the next time that service starts — often at boot, often running as SYSTEM — Windows launches the attacker's file instead.

## Weak service permissions

A service whose executable file, or the service configuration itself, is writable by a low-privilege account is a direct escalation path — replace the binary a SYSTEM-level service points to, restart or wait for the service to restart, and the attacker's code now runs with that service's privileges. `sc.exe` and tools like `accesschk` (Sysinternals) are what both attackers and defenders use to enumerate exactly which services have permissions loose enough to matter.

## Token impersonation ("Potato" family)

A different mechanism entirely: Windows services running under privileged accounts (like `NT AUTHORITY\SYSTEM` or a service account with `SeImpersonatePrivilege`) can be tricked into authenticating to an attacker-controlled listener, handing over a token the attacker then impersonates. The "Potato" exploit family (JuicyPotato, RoguePotato, and their descendants) automates exactly this — coercing a privileged local service into authenticating locally, then capturing and reusing that authentication token directly as SYSTEM.

> [!PLAIN]
> `SeImpersonatePrivilege` is a legitimate right many service accounts genuinely need — it lets a service impersonate the client it's acting on behalf of. The Potato techniques don't bypass this privilege; they abuse the fact that a service holding it can be coerced into impersonating something far more privileged than intended.

## Normal baseline

Service binary and configuration permissions restrict write access to administrators only, service paths are properly quoted, and `SeImpersonatePrivilege` is held only by the specific service accounts that genuinely require it — not broadly assigned across every service account in the environment.

## Red flags

- **A new service installed** (Event ID 7045) **immediately followed by a process launch from an unusual path**, especially one matching an unquoted-path intermediate segment.
- **A file write to a directory that a known SYSTEM-level service's path traverses**, from a low-privilege account.
- **A service configuration change** (permissions, binary path, or account) made by an account with no prior administrative history.
- **A local process suddenly running as SYSTEM with no corresponding privileged logon event** — the signature Potato-family exploits leave, since the elevation happens via token impersonation rather than an actual privileged authentication event.

## How to collect it

Event ID 7045 (new service installed) and Event ID 4697 (service installed, if auditing is enabled) for the service-based paths. Process-creation logging (Event ID 4688 or Sysmon Event ID 1) showing a process suddenly running as SYSTEM with a parent process inconsistent with normal service-start behavior is the strongest signal for token-impersonation-based escalation specifically, since there's no separate "privilege escalated" event to alert on directly — the token was already legitimately available, just used somewhere it shouldn't have been.

## ATT&CK mapping

Unquoted service paths and weak service permissions both fall under [Hijack Execution Flow: Path Interception (T1574.007)](https://attack.mitre.org/techniques/T1574/) and related Path Interception sub-techniques. Token impersonation maps to [Access Token Manipulation (T1134)](https://attack.mitre.org/techniques/T1134/). A successful local privilege escalation is frequently the step that immediately precedes — and enables — the [Discovery](#/lesson/l2-11-discovery) and [LOLBin](#/lesson/l2-12-lolbins) activity covered earlier in this level, since an attacker rarely bothers enumerating a domain from an account with no local administrative rights at all.

## Sources

- MITRE ATT&CK — [Privilege Escalation (TA0004)](https://attack.mitre.org/tactics/TA0004/), [T1543.003 Windows Service](https://attack.mitre.org/techniques/T1543/003/), [T1574 Hijack Execution Flow](https://attack.mitre.org/techniques/T1574/)
- Windows Internals (Russinovich, Solomon, Ionescu) — tokens, privileges, and the Service Control Manager
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
