[Prefetch](#/lesson/l2-01-prefetch) tells you a program executed. UserAssist tells you a **person clicked it** — and how long they then actually looked at it. That distinction between "ran" and "a human deliberately launched and used it" is what makes this small artifact worth its own lesson.

## Where it lives

```
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\UserAssist\{GUID}\Count
```

Two GUIDs carry the useful data:

- **`{CEBFF5CD-ACE2-4F4F-9178-9926F41749EA}`** — executable file execution
- **`{F4E57C4B-2036-45F0-A9AB-443BCFE33D9F}`** — shortcut (`.lnk`) file execution

## ROT13

Value names are **ROT13-encoded** — every letter rotated thirteen places. `PROGRAM` becomes `CEBTENZ`. This is not security or obfuscation in any meaningful sense; it is a legacy design choice that stops the names appearing in a plain string search of the hive. Every parsing tool decodes it automatically, but it is worth recognizing so that a hex-level look at the hive is not confusing.

## What each entry records

- **Run count** — how many times launched
- **Last execution time**
- **Focus count** — how many times the window was brought to the foreground
- **Focus time** — total milliseconds the application was actually in focus

**Focus time is unusual and underused.** No other standard Windows artifact tells you how long a user genuinely engaged with an application, as opposed to whether it started. A tool launched once and used for two hours reads very differently from one launched once, focused for four seconds, and abandoned.

## The scope limitation

UserAssist records **GUI launches only** — programs started via Explorer, the Start menu, the desktop, or a shortcut. It does **not** record:

- Command-line execution
- Scheduled task or service execution
- Programs launched by other programs

That makes it the natural complement to Prefetch rather than a substitute: Prefetch catches execution regardless of origin, UserAssist isolates the subset a human deliberately clicked. An entry here means a user made a choice.

## Normal baseline

Entries correspond to applications the user's role would explain, with run counts and focus times consistent with genuine use. Paths point at Program Files and standard install locations.

## Red flags

- **A GUI launch of a tool from `%TEMP%`, `%APPDATA%`, or a removable drive** — someone deliberately double-clicked something in a staging location.
- **Administrative or dual-use tooling** (PsExec, archive utilities, network scanners) launched from an account with no administrative role.
- **High focus time on a suspicious binary**, indicating sustained interactive use rather than an automated launch.
- **Launches during a window when the account owner was not working** — pairs with the same session-attribution reasoning as [ShellBags](#/lesson/l2-07-shellbags).
- **A run count of 1 with minimal focus time on a known-bad binary** — consistent with an accidental or one-off execution rather than deliberate tooling.

## How to collect it

Parse `NTUSER.DAT` per user with **Registry Explorer** (which decodes ROT13 and the binary value structure) or **RegRipper**'s `userassist` plugin. Read it alongside Prefetch: a binary in Prefetch but absent from UserAssist ran without a human clicking it, which is itself informative.

## ATT&CK mapping

Evidence-source content. Useful in establishing [User Execution (T1204)](https://attack.mitre.org/techniques/T1204/), where the question is specifically whether a person launched something.

## Sources

- [Eric Zimmerman's tools — Registry Explorer](https://ericzimmerman.github.io/)
- 13cubed — UserAssist analysis (YouTube)
- SANS FOR500 — Windows Forensic Analysis
