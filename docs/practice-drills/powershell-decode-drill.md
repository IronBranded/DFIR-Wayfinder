---
tags:
  - Practice Drill
---

# Drill: PowerShell Decode

## The scenario

The following command line was pulled from a Sysmon Event ID 1 record. Before expanding the answer, decode it yourself using the technique from [Obfuscation & Decoding](../04-powershell-forensics/obfuscation-decoding.md) — this example is fresh, not one already shown on that page.

```
powershell.exe -EncodedCommand bgBlAHQAIAB1AHMAZQByACAAYgBhAGMAawB1AHAAcwB2AGMAIABQAEAAcwBzAHcAMAByAGQAMQAyADMAIQAgAC8AYQBkAGQAIAAmACAAbgBlAHQAIABsAG8AYwBhAGwAZwByAG8AdQBwACAAYQBkAG0AaQBuAGkAcwB0AHIAYQB0AG8AcgBzACAAYgBhAGMAawB1AHAAcwB2AGMAIAAvAGEAZABkAA==
```

Try it yourself first — either in a PowerShell session with the one-liner from the walkthrough page, or in CyberChef — before expanding below.

??? question "Reveal the decoded command and the analysis"

    Decoded (UTF-16LE, per the walkthrough page's method):

    ```
    net user backupsvc P@ssw0rd123! /add & net localgroup administrators backupsvc /add
    ```

    **What it does:** creates a new local user account named `backupsvc` with a hardcoded password, then immediately adds that account to the local Administrators group. Two commands chained with `&` in a single encoded blob.

    **Why the obfuscation matters here, specifically:** neither command is inherently rare — account creation and group membership changes happen legitimately all the time. What makes this worth flagging is that it arrived **encoded** at all. A legitimate administrative script creating a service account has no reason to hide two entirely ordinary `net` commands behind Base64 — see the closing point on [Malicious Cmdlet Patterns](../04-powershell-forensics/powershell-malicious-patterns.md): obfuscation of otherwise-unremarkable commands is itself the strongest signal on that whole page.

    **The account name is also worth noting on its own:** "backupsvc" is deliberately chosen to sound like a legitimate service account during a quick review — exactly the kind of plausible-sounding name that a rushed analyst might skim past. Cross-reference against your actual inventory of sanctioned service accounts before assuming it's legitimate just because it sounds like it could be.

    **What to do next:** check whether `backupsvc` still exists and is still in Administrators (see [Event Log Key IDs](../01-windows-endpoint/event-log-key-ids.md) — Event ID 4720 for the creation, 4732 for the group addition), and treat this the same as any other [AdminSDHolder](../02-active-directory/adminsdholder.md)-adjacent privilege escalation if the host is domain-joined and this account could plausibly reach further.

<!-- BACKLINKS:START -->
## Referenced From

- [PowerShell Forensics: Obfuscation & Decoding](../04-powershell-forensics/obfuscation-decoding.md)
- [Practice Drills](index.md)

<!-- BACKLINKS:END -->

