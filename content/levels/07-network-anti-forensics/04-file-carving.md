When a file is deleted, NTFS marks its MFT record and its clusters as available. It does not erase the data. Carving recovers files from that space by **content signature alone**, after the filesystem's own record of them is gone.

## How signatures work

Most file formats begin and end with recognizable byte sequences:

| Format | Header | Footer |
|---|---|---|
| JPEG | `FF D8 FF` | `FF D9` |
| PNG | `89 50 4E 47` | `IEND` |
| PDF | `%PDF` | `%%EOF` |
| ZIP / Office | `50 4B 03 04` | — |
| PE executable | `4D 5A` (`MZ`) | — |

A carver scans unallocated space for headers, then reads forward to a footer or a size limit. No filesystem involvement at any point.

## The limitation that defines the technique

**Carving assumes the file is contiguous.** Most carvers read forward from the header, and if the file was fragmented across non-adjacent clusters, they recover the first fragment and whatever unrelated data follows it. The result is a file that may open, may be partially readable, and may be silently wrong.

Two further consequences of working without the filesystem:

- **No metadata.** No filename, no path, no timestamps, no owner. You recover content, stripped of everything that would place it in a timeline.
- **False positives.** A signature can appear inside another file, producing plausible-looking recoveries that are fragments of something else entirely.

## Prefer MFT-based recovery when you can

If the MFT record survives — deleted but not yet reused — it holds the filename, path, timestamps, and the cluster runs describing exactly which clusters the file occupied, **including fragmented ones**. That is strictly better than carving: correct reassembly plus full metadata.

The order of preference is therefore: recover from the MFT record if it exists, carve only when it does not.

> [!TIP]
> For very small files there is a third option that beats both. Files under roughly 700 bytes are stored **resident**, inside the MFT record itself rather than in separate clusters — so [the `$MFT`](#/lesson/l2-02-mft-timestomping) may still contain the actual contents of a deleted script or configuration file, complete and with its metadata intact.

## Where this matters in enterprise DFIR

- **Deleted attacker tooling** — a binary removed after use.
- **Staging archives** — the `.zip` or `.rar` assembled before [exfiltration](#/lesson/l8-07-playbook-data-exfiltration), often deleted immediately after transfer.
- **Deleted logs** — complementary to [carving EVTX records](#/lesson/l7-06-log-artifact-recovery) specifically.
- **Documents** relevant to an [insider case](#/lesson/l8-06-playbook-insider-threat).

## Red flags in recovered content

- **A recovered PE executable** from unallocated space in a user profile or temp directory.
- **A recovered archive** whose contents match sensitive data categories.
- **Recovered fragments matching known-bad hashes**, where enough of the file survived to hash meaningfully.

## How to collect it

**PhotoRec** is the general-purpose carver with the broadest format support. **bulk_extractor** takes a different approach, scanning for features — email addresses, URLs, credit card numbers — rather than whole files, which is often more useful for scoping. **scalpel** and **foremost** are the classic header/footer carvers.

Run carving against a **forensic image**, never a live volume, and expect to triage a large volume of false positives. Where the MFT is available, parse it first — recovering from records is faster and produces better results than carving the same data blindly.

## ATT&CK mapping

Recovery technique countering [Indicator Removal: File Deletion (T1070.004)](https://attack.mitre.org/techniques/T1070/004/).

## Sources

- [PhotoRec / TestDisk](https://www.cgsecurity.org/wiki/PhotoRec)
- [bulk_extractor](https://github.com/simsong/bulk_extractor)
- SANS FOR500 — Windows Forensic Analysis
