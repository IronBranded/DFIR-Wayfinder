---
tags:
  - Practice Drill
---

# Drill: Timeline Correlation

## The scenario

A file server admin reports mass file encryption on `FILE-SRV02` at 14:47 UTC. Three independent sources below, exactly as pulled — none of them adjusted for anything yet. Before expanding the answer: is there a clock problem here, and if so, what's the true sequence of events, including patient zero?

**Source 1 — `WKS-2214` local Prefetch (workstation, user's own machine)**

```
Source .pf file: INVOICE_2026.PDF.EXE-4F1A8B2C.pf
Run Count: 1
Last Run (local, WKS-2214): 13:54:00
```

**Source 2 — `WKS-2214` local Sysmon Event ID 3 (same workstation)**

```
13:55:15 (local, WKS-2214) — outbound SMB connection, WKS-2214 -> FILE-SRV02:445
```

**Source 3 — central network/DHCP log (independent, NTP-synced infrastructure)**

```
14:03:15 UTC — SMB connection logged, WKS-2214 -> FILE-SRV02:445, port 445
```

**Source 4 — `FILE-SRV02` local Sysmon (server, separately NTP-synced — treat as accurate)**

```
14:04:00 UTC — mass FileCreate/FileModify activity begins, ransomware extension pattern
```

??? question "Reveal the answer"

    **Step 1 — spot the calibration opportunity.** Source 2 and Source 3 describe the *same connection* — same source, same destination, same port — logged by two different systems. That's your independent cross-reference, exactly per [Timeline Construction & Correlation](../00-foundations/timeline-construction.md).

    ```
    WKS-2214 local time for the connection:  13:55:15
    Network log time, same connection:       14:03:15
    Skew: WKS-2214's clock is 8 minutes SLOW
    ```

    **Step 2 — apply the correction to every `WKS-2214`-local timestamp, not just the one you checked.**

    | Event | As recorded (WKS-2214 local) | Corrected (true UTC) |
    |---|---|---|
    | `INVOICE_2026.PDF.EXE` executes (Prefetch) | 13:54:00 | **14:02:00** |
    | SMB connection to `FILE-SRV02` (Sysmon 3) | 13:55:15 | **14:03:15** *(now matches the network log exactly — correction confirmed)* |

    `FILE-SRV02`'s own Sysmon entry needs no correction — it's a separately NTP-synced server, and its 14:04:00 timestamp is already the accurate reference the correction above was checked against.

    **Step 3 — the corrected sequence.**

    1. **14:02:00** — ransomware executes on `WKS-2214`, disguised as `INVOICE_2026.PDF.EXE` — this is patient zero.
    2. **14:03:15** — the same host connects to `FILE-SRV02` over SMB — network-based propagation, about 75 seconds after execution.
    3. **14:04:00** — encryption begins on `FILE-SRV02`, roughly 45 seconds after the connection lands.
    4. **14:47** — an admin notices, over 40 minutes after the true starting point.

    **Why the uncorrected version would have misled the investigation:** without the correction, `WKS-2214`'s Prefetch entry (13:54:00) sits *before* its own Sysmon connection record (13:55:15) — internally consistent, so nothing looks obviously wrong at a glance. The mistake wouldn't be a contradiction you'd notice; it would be a full 8-minute error in exactly where you draw the boundary of "before this, the host was clean." On a host you're trying to determine a clean restore-point for, that's not a rounding error — it's the difference between restoring from a backup that still contains the dropper and one that doesn't.

    **What this confirms:** `WKS-2214` is patient zero, not `FILE-SRV02` — the file server is a propagation target, not the entry point. That changes where remediation starts: per the [Ransomware playbook](../08-playbooks/ransomware.md), initial-vector analysis belongs on `WKS-2214` (how did `INVOICE_2026.PDF.EXE` get there — check [Phishing](../08-playbooks/phishing.md) delivery data), not on the server where the damage was actually noticed.

<!-- BACKLINKS:START -->
## Referenced From

- [Practice Drills](index.md)

<!-- BACKLINKS:END -->

