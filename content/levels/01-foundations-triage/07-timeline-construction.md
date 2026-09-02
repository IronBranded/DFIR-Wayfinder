Individual artifacts answer individual questions. A timeline answers the question an incident is actually about: **what happened, in what order**. Building one means merging sources that disagree about time zones, disagree about precision, and occasionally disagree about what time it was at all.

## What a super-timeline merges

- **`$MFT`** — MACB timestamps for every file ([with the `$SI`/`$FN` caveats](#/lesson/l4-05-mft-timestomping))
- **[USN journal](#/lesson/l4-06-usn-journal)** — file change events with reason codes
- **[Event logs](#/lesson/l4-11-event-log-key-ids)** — logons, process creation, service installs
- **Registry key `LastWriteTime`** — [persistence installation dates](#/lesson/l5-01-registry-run-keys)
- **[Prefetch](#/lesson/l4-01-prefetch)** — up to eight execution times per binary
- **Browser history, LNK files, ShellBags** — user activity

## Everything becomes UTC

The single most consequential formatting decision. Different sources record time differently:

| Source | Stored as |
|---|---|
| Windows event logs | UTC internally, displayed in local time |
| `$MFT` and `$FN` timestamps | UTC |
| Registry `LastWriteTime` | UTC |
| Many application logs | **Local time, often with no offset recorded** |
| Cloud audit logs | Usually UTC |

That fourth row is where timelines quietly break. An application log in local time with no offset, merged into a UTC timeline without conversion, produces events displaced by hours — and a displaced event does not look wrong, it looks like a different event.

> [!IMPORTANT]
> Normalize everything to UTC, and **state the timezone explicitly in the report**. A timeline whose timezone is not stated is not a finding; it is a set of numbers someone else will misread. This single sentence in a report prevents more misunderstandings than any other.

## Clock skew calibration

A host's clock may simply have been wrong. When it was, every timestamp from that host is offset by an unknown amount — which corrupts correlation against every other source.

The calibration trick: **find one event recorded independently in two places.** A logon appears in the workstation's Security log *and* in the domain controller's. The DC is authoritative. The difference between the two recorded times is the workstation's skew, and applying it as a constant offset re-aligns everything else from that host.

Any cross-recorded event works — a service connection logged at both ends, a file transfer, an authentication. What matters is that one source can be trusted and the other measured against it.

## Pivot, then expand

A full-disk super-timeline runs to millions of rows. Reading it start to finish is not a technique.

The method is to **pivot from a known event**: the alert, the ransom note's creation time, the first [1116 Defender detection](#/lesson/l2-05-defender-av-mechanics). Filter tightly around it — minutes, not days. Establish what happened in that window, then expand outward in both directions, following what you find rather than reading sequentially.

Working backwards matters as much as forwards. The alert is rarely the beginning; [ransomware in particular is the end of an intrusion](#/lesson/l8-05-playbook-ransomware), and the interesting activity precedes it by days or weeks.

## When the timestamps are lying

Timestomping targets `$SI`, which is what most timeline tools read by default. When a timeline looks implausible — a binary present since 2009 in a directory created last month — the corroborating sources are `$FN` timestamps and the [USN journal](#/lesson/l4-06-usn-journal), which record the event rather than the state and which timestomping tools generally do not scrub.

## Tools

**Plaso / log2timeline** builds super-timelines across many source types in one pass, producing very complete and very large output. **Timeline Explorer** (Eric Zimmerman) is the practical viewer for the resulting CSV — filtering, tagging, and column-level search across millions of rows. **EvtxECmd**, **MFTECmd**, and the rest of the Zimmerman set produce normalized CSV that feeds the same viewer.

## Red flags in your own timeline

- **Mixed time zones** in a single merged output.
- **No stated timezone** in the report.
- **Uncalibrated clock skew** on a host known to have had time problems.
- **A timeline built only from `$SI`** where timestomping is plausible.
- **A timeline that starts at the alert** and never looks earlier.

## Sources

- [Plaso / log2timeline](https://plaso.readthedocs.io/)
- [Eric Zimmerman's tools — Timeline Explorer](https://ericzimmerman.github.io/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
