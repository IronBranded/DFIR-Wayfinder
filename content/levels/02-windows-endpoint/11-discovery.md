Discovery is almost never the headline of an incident report, and it's almost always the first thing that actually happens after a foothold. An attacker who just landed on a host doesn't know anything about it yet — not who they're logged in as, not what else is on the network, not whether this machine is worth the effort. Discovery is how they find out, and every command they run to do it either lands in a log or doesn't, which makes recognizing this phase one of the earliest, cheapest wins available to a defender.

> [!PLAIN]
> This academy's own ATT&CK Coverage Map calls Discovery "a genuine gap" in earlier content — this lesson is the direct response to that, not a retrofit dressed up as always having been there.

## The five commands worth recognizing on sight

These are Windows-native, built-in, require no tooling an attacker has to bring with them, and show up constantly enough in real intrusions to be worth memorizing cold — not because they're individually suspicious (system administrators run every one of these routinely), but because the *pattern* of several run back-to-back, seconds apart, from a freshly-landed session is a real signal.

| Command | ATT&CK technique | What it tells the attacker |
|---|---|---|
| `whoami /all` | System Owner/User Discovery (T1033) | Current user, group memberships, privileges |
| `systeminfo` | System Information Discovery (T1082) | OS version, patch level, domain membership |
| `net user /domain`, `net group "Domain Admins" /domain` | Account Discovery (T1087) | Who exists, who's privileged, worth targeting |
| `ipconfig /all` | System Network Configuration Discovery (T1016) | Network segment, DNS servers, adapter details |
| `nltest /domain_trusts` | Domain Trust Discovery (T1482) | Trust relationships — where else this domain reaches |

> [!NOTE]
> `nltest /domain_trusts` deserves particular attention: it's a genuinely uncommon command for anyone other than a domain administrator to run, which makes it one of the highest-signal individual commands on this list rather than something that needs a pattern of several together to be worth flagging.

## Normal baseline

Administrators run every one of these commands too — routinely, and usually for entirely mundane reasons (troubleshooting, onboarding, inventory scripts). The baseline isn't "this command never appears," it's **who ran it, from where, and what came immediately before and after**. A helpdesk account running `systeminfo` against a ticketed machine during business hours is unremarkable. The same command from an account with no history of interactive administrative work, seconds after a suspicious sign-in, in a tight cluster with three or four other discovery commands, is a different picture entirely.

> [!IMPORTANT]
> Discovery is iterative, not a one-time event. A real intrusion repeats this pattern at every new foothold — the first host compromised, then again after lateral movement to a second, a third. Seeing the same discovery-command cluster on multiple hosts in sequence is itself a scoping signal: it traces the attacker's actual path through the environment.

## Red flags

- **A tight cluster of several discovery commands** (three or more of the five above) executed within seconds of each other, from a single session.
- **`nltest /domain_trusts` or `net group "Domain Admins" /domain`** from an account with no prior history of that kind of administrative query.
- **The same discovery pattern repeating on multiple hosts in sequence** — a strong signal of active lateral movement, not just one curious user.
- **Discovery commands immediately following a Golden Ticket or Pass-the-Hash-style authentication event** (see [Level 4](#/lesson/l4-06-golden-silver-ticket)) — an attacker orienting themselves the moment stolen or forged credentials actually work.

> [!CAUTION]
> Discovery commands run via a LOLBin or an unusual parent process — `cmd.exe` spawned from `winword.exe`, for instance — rather than an interactive session at all. That parent-child mismatch is often a stronger signal than the discovery command itself; see the next lesson for exactly this pattern.

## How to collect it

Windows Security Event ID 4688 (process creation) with command-line auditing enabled, or Sysmon Event ID 1, are the primary sources — command-line auditing specifically has to be turned on (`Include command line in process creation events` group policy) or these commands are invisible in the log by process name alone, with no argument visibility to distinguish `whoami` from `whoami /all`.

## ATT&CK mapping

Discovery is its own MITRE ATT&CK tactic ([TA0007](https://attack.mitre.org/tactics/TA0007/)), not a single technique — the table above maps five of its most common Windows-native sub-techniques. [Account Discovery (T1087)](https://attack.mitre.org/techniques/T1087/) and [Domain Trust Discovery (T1482)](https://attack.mitre.org/techniques/T1482/) specifically feed directly into the AD attack chain covered in [Level 4](#/lesson/l4-01-ntds-dit).

## Sources

- MITRE ATT&CK — [Discovery (TA0007)](https://attack.mitre.org/tactics/TA0007/), [T1087 Account Discovery](https://attack.mitre.org/techniques/T1087/), [T1018 Remote System Discovery](https://attack.mitre.org/techniques/T1018/)
- [Microsoft Security Blog — living-off-the-land and hands-on-keyboard activity (MSTIC)](https://www.microsoft.com/en-us/security/blog/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
