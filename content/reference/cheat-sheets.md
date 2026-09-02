# Windows IR Quick Reference

The condensed field reference — the handful of facts worth having memorized before you're in the middle of an incident.

## Event IDs worth knowing cold

| ID | Meaning |
|---|---|
| 4624 / 4625 | Successful / failed logon |
| 4688 | New process creation |
| 4104 | PowerShell script block logged |
| 7045 | New service installed |
| 4720 | User account created |
| 4732 | Member added to a security-enabled group |

## MACB timestamp quick rules

- **SI creation earlier than FN creation** → the textbook timestomping signature.
- **A cross-volume move produces the same shape, benignly** — rule this out first. See [Level 2: $MFT & Timestomping](#/lesson/l4-05-mft-timestomping).
- **Modified earlier than Created is normal for a copy** — not evidence on its own.

## The hybrid account-compromise runbook, condensed

1. `Revoke-MgUserSignInSession` — immediately.
2. Reset the password — on-prem AD first if hybrid-synced.
3. Force an Entra Connect delta sync.
4. Reset the password again.
5. Revoke sessions again.
6. Review MFA methods and mailbox rules added during the compromise window.

Full reasoning: [Level 6: Hybrid Account-Compromise Runbook](#/lesson/l2-04-hybrid-runbook).

## Order of Volatility, short form

CPU registers/cache → RAM → network state → running processes → disk → logs → archival backups. Collect in that order when you can't collect everything at once.
