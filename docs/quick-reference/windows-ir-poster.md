# Windows IR Quick Reference

<style>
.poster-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin: 20px 0; }
.poster-grid .poster-card { border: 1px solid var(--md-default-fg-color--lightest, #ccc); border-radius: 4px; padding: 10px 16px; background: var(--md-code-bg-color, #f5f5f5); font-size: 0.85em; }
.poster-grid .poster-card h3 { margin-top: 0.4em; margin-bottom: 0.4em; font-size: 1em; text-transform: uppercase; letter-spacing: 0.03em; color: #2dd4bf; border-bottom: 1px solid currentColor; padding-bottom: 4px; }
.poster-grid .poster-wide { grid-column: 1 / -1; }
.poster-flag { color: #f59e0b; font-weight: 600; }
.poster-ok { color: #2dd4bf; font-weight: 600; }
</style>

One page, meant to stay open during an active incident — not a substitute for the full pages, a pointer back into them. Every fact here is explained and sourced in depth elsewhere in this guide; this page exists to save you a click when you already know what you're looking for.

<div class="poster-grid" markdown="1">

<div class="poster-card" markdown="1">
### Order of Volatility

1. CPU registers/cache
2. RAM, routing table, ARP cache
3. Swap/page file
4. Disk
5. Remote logs
6. Physical config
7. Archival media

*Full page: [Order of Volatility](../00-foundations/order-of-volatility.md)*
</div>

<div class="poster-card" markdown="1">
### Baseline Process Tree

```
System(4)
 └ smss.exe
    ├ csrss.exe
    ├ wininit.exe
    │  ├ services.exe
    │  │  └ svchost.exe (-k, many)
    │  └ lsass.exe   * only one, ever *
    └ winlogon.exe
       └ userinit.exe (exits)
          └ explorer.exe
```

*Full page: [Baseline Process Trees](../01-windows-endpoint/process-trees.md)*
</div>

<div class="poster-card" markdown="1">
### Top Event IDs

- `4624`/`4625` — logon success/fail
- `4688` — process creation
- `4662` — DCSync signature
- `4698` — scheduled task created
- `4769` — Kerberos TGS request
- `5136` — AD object modified
- **`1102`** — Security log cleared
- `7045` — service installed
- `4104` — PowerShell script block

*Full page: [Event Log Key IDs](../01-windows-endpoint/event-log-key-ids.md)*
</div>

<div class="poster-card" markdown="1">
### Persistence — Where to Look First

- `HKCU`/`HKLM ...\Run` — Run keys
- `C:\Windows\System32\Tasks` — Scheduled Tasks
- `HKLM\SYSTEM\...\Services` — Services
- `root\subscription` (WMI) — Event Subscriptions
- `...\Winlogon\Shell`, `Userinit`
- Cloud: OAuth grants, mailbox rules, break-glass sign-ins

*Full page: [Persistence Catalog](../05-persistence/index.md)*
</div>

<div class="poster-card poster-wide" markdown="1">
### The One Line to Memorize — Decode `-EncodedCommand`

```powershell
[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String("<blob>"))
```

Still garbage after decoding? It's compressed — try Gunzip, then Raw Inflate, in CyberChef.

*Full page: [Obfuscation & Decoding](../04-powershell-forensics/obfuscation-decoding.md)*
</div>

<div class="poster-card" markdown="1">
### Hybrid Account Compromise — Order

1. Disable on-prem AD account
2. Reset password **twice**
3. `Revoke-MgUserSignInSession`
4. Remove attacker persistence, *then* re-enable

*Full page: [Cloud Identity runbook](../06-cloud-identity/index.md)*
</div>

<div class="poster-card" markdown="1">
### krbtgt Compromise — Order

1. Reset once
2. Wait for replication convergence
3. Wait ~10 hrs (default ticket lifetime)
4. Reset again, converge again

*Full page: [krbtgt](../02-active-directory/krbtgt.md)*
</div>

<div class="poster-card" markdown="1">
### Memory Triage — Fast Path

- `pslist` vs `psscan` → diff for hidden
- `malfind` → RWX, unbacked memory
- `ldrmodules` → VAD present, PEB missing
- `threads` → unresolved start_path
- `mutantscan` → fingerprint the family

*Full page: [Malware Triage Methodology](../03-memory-forensics/malware-triage-methodology.md)*
</div>

<div class="poster-card" markdown="1">
### Confidence Language

- **Confirmed** — 2+ independent sources agree
- **Assessed / Likely** — strong single source
- **Possible** — a lead, not yet actionable alone

*Full page: [Reporting & Communication](../00-foundations/reporting-and-communication.md)*
</div>

</div>

<!-- BACKLINKS:START -->
## Referenced From

- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

## Sources

Every fact on this page is sourced on the full page it links to — this page intentionally carries no separate sourcing of its own, to avoid two slightly-different versions of the same citation existing in the guide.
