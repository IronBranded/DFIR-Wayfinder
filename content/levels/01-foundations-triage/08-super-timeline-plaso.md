[Timeline construction](#/lesson/l1-07-timeline-construction) covered the principles — normalize to UTC, calibrate skew, pivot rather than read. This lesson is the actual toolchain, because a super timeline is built by a specific sequence of commands and knowing them is the difference between the concept and the capability.

## Two toolchains, two purposes

**The filesystem timeline** — Sleuth Kit, fast, `$MFT`-only:

```bash
fls -r -m C: /path/to/image.dd > bodyfile.txt
mactime -b bodyfile.txt -d -z UTC 2026-08-27 > fs_timeline.csv
```

`fls` walks the filesystem and emits **bodyfile** format — a pipe-delimited intermediate holding MACB times per file. `mactime` converts that into a sorted, human-readable timeline. Minutes to produce, filesystem metadata only.

**The super timeline** — Plaso, comprehensive, everything:

```bash
log2timeline.py --storage-file timeline.plaso /path/to/image.dd
psort.py -o l2tcsv -w super_timeline.csv timeline.plaso
```

`log2timeline.py` runs dozens of parsers across the image — `$MFT`, event logs, registry, Prefetch, browser databases, LNK files, and more — into an intermediate storage file. `psort.py` then filters, sorts, and exports it.

## Why the two-stage design matters

Parsing is expensive; filtering is cheap. `log2timeline` runs **once**, potentially for hours, producing a storage file. `psort` then runs repeatedly against that same file with different filters, seconds at a time.

That is the workflow: parse once, query many times. Re-running `log2timeline` because you want a different date range is the most common beginner mistake and can cost an afternoon.

## Filtering, which is not optional

A full super timeline of a single workstation runs to **millions of rows**. It is not readable and was never meant to be.

```bash
psort.py -o l2tcsv -w window.csv timeline.plaso \
  "date > '2026-08-27 09:00:00' AND date < '2026-08-27 12:00:00'"
```

Targeted collection at parse time helps too — restricting `log2timeline` to specific parsers or artifact sets produces a smaller storage file when you already know what you are after.

> [!IMPORTANT]
> Plaso timestamps are UTC throughout, but **`mactime` requires `-z` explicitly** and will happily emit local-time output if you omit it. Mixing a `-z UTC` Plaso export with a timezone-defaulted `mactime` export is exactly the merge error [timeline construction](#/lesson/l1-07-timeline-construction) warns about, produced by your own tooling rather than by a source log.

## Reading the output

**Timeline Explorer** (Eric Zimmerman) is the practical viewer for the resulting CSV — column filtering, tagging, and search across millions of rows, with the tagging being the part that matters: mark the rows that matter as you find them, and the tagged subset becomes the timeline that goes in the report.

## Where each toolchain fits

| Situation | Use |
|---|---|
| Need file activity fast, one volume | `fls` → `mactime` |
| Need everything correlated across artifact types | `log2timeline` → `psort` |
| Already have Zimmerman CSV output | Merge in Timeline Explorer directly |

The Zimmerman tools this academy uses throughout — `MFTECmd`, `EvtxECmd`, `PECmd`, `LECmd` — all emit CSV designed to load into Timeline Explorer together, which is a lighter-weight route to a merged timeline than Plaso when you already know which artifacts you need.

## Red flags in your own process

- **Re-running `log2timeline` to change a date range** rather than re-running `psort`.
- **An unfiltered super timeline** opened and scrolled rather than pivoted.
- **`mactime` run without `-z`**, silently producing local-time rows for a UTC timeline.
- **No tagging**, so the analytical work of identifying relevant rows is not preserved anywhere.

## Sources

- [Plaso / log2timeline documentation](https://plaso.readthedocs.io/)
- [The Sleuth Kit — fls and mactime](https://www.sleuthkit.org/sleuthkit/man/)
- [Eric Zimmerman's tools — Timeline Explorer](https://ericzimmerman.github.io/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
