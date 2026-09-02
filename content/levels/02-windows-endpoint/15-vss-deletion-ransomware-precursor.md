The [anti-forensics Volume Shadow Copy lesson](#/lesson/l7-07-vss-recovery) covers VSS from the defender's side — what's recoverable from shadow copies after an incident. This lesson covers the other direction entirely: an attacker deliberately destroying that same recovery option, deliberately, right before the actual damage happens.

> [!PLAIN]
> Ransomware's real leverage isn't the encryption itself — it's making sure you can't just restore from a shadow copy or a backup and walk away. Inhibiting recovery is what turns "we got encrypted" into "we have no choice but to consider paying."

## The commands worth recognizing on sight

| Command | Effect |
|---|---|
| `vssadmin.exe delete shadows /all /quiet` | Deletes every shadow copy on the system silently |
| `wmic shadowcopy delete` | The WMI equivalent — same effect, different binary |
| `wbadmin.exe delete catalog -quiet` | Deletes the Windows Backup Catalog itself |
| `bcdedit /set {default} bootstatuspolicy ignoreallfailures` + `bcdedit /set {default} recoveryenabled no` | Disables Windows' automatic recovery boot options |
| `diskshadow delete shadows all` | An alternate, less commonly monitored tool for the same shadow-copy deletion |

A quieter variant worth knowing separately: rather than deleting shadow copies outright, some ransomware families **shrink the allocated shadow copy storage** via `vssadmin resize shadowstorage` down toward the minimum allowed size (320 MB) — once existing snapshots exceed that shrunken allocation, Windows deletes them automatically, achieving the same result without a single explicit delete command ever appearing in the log.

## Normal baseline

`vssadmin`, `wbadmin`, and `bcdedit` are legitimate administrative tools, and shadow copies do get cleaned up periodically as part of normal disk-space management. The baseline is *scale and speed*: a scheduled cleanup job removing a handful of aged shadow copies over time looks nothing like every shadow copy on a system disappearing in a single command, seconds before mass file encryption begins.

## Red flags

- **`vssadmin delete shadows /all` executed outside any known backup-maintenance window or scheduled task.**
- **Multiple different tools used for the same effect in quick succession** — `vssadmin` followed by `wmic shadowcopy delete` followed by `wbadmin delete catalog` — redundancy that makes sense for an attacker maximizing certainty, not for routine administration.
- **A `bcdedit` command disabling recovery boot options**, especially paired with any of the shadow-copy deletion commands above.
- **A sudden, unexplained drop in shadow copy storage allocation** via `vssadmin resize shadowstorage`, without a corresponding explicit delete command — the stealthier variant.
- **Any of these commands immediately preceding mass file modification or a spike in file-write activity** — the sequence, not just the isolated command, is what confirms ransomware rather than legitimate cleanup.

> [!WARNING]
> By the time you're looking for this, the shadow copies may already be gone — this is fundamentally a *prevention and early-detection* lesson more than a post-incident recovery one. Alerting on these specific command-line patterns in near-real-time, before encryption completes, is the actual value; finding them in a log after full encryption confirms what happened but doesn't change the outcome.

## How to collect it

Event ID 4688 (process creation) with command-line auditing enabled, or Sysmon Event ID 1 — filtering specifically on `vssadmin.exe`, `wbadmin.exe`, `bcdedit.exe`, `wmic.exe`, and `diskshadow.exe` with the specific argument patterns above (`delete shadows`, `recoveryenabled no`, `shadowcopy delete`, `resize shadowstorage`) is a well-established, high-value hunt query worth having pre-built and alerting, not written from scratch mid-incident.

## ATT&CK mapping

Maps directly to [Inhibit System Recovery (T1490)](https://attack.mitre.org/techniques/T1490/), which explicitly exists to *augment* the impact of [Data Encrypted for Impact (T1486)](https://attack.mitre.org/techniques/T1486/) — the two techniques are almost always paired in a real ransomware timeline, with T1490 preceding T1486 by minutes, not hours. Detecting T1490 in progress is one of the few realistic chances to interrupt a ransomware deployment before encryption completes rather than only investigating after the fact.

## Sources

- MITRE ATT&CK — [T1490 Inhibit System Recovery](https://attack.mitre.org/techniques/T1490/)
- [Microsoft Learn — Volume Shadow Copy Service](https://learn.microsoft.com/en-us/windows-server/storage/file-server/volume-shadow-copy-service)
- [Microsoft Security Blog — human-operated ransomware (MSTIC)](https://www.microsoft.com/en-us/security/blog/)
- SANS FOR528 — Ransomware for Incident Responders
