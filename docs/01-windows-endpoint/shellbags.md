---
tags:
  - Windows Endpoint
  - T1083
---

# Artifact: ShellBags

## What it is / where it lives

Every time a user browses a folder in Windows Explorer, Explorer remembers how that folder was displayed — icon size, sort order, window position — and stores that preference in the registry. That's the intended purpose. The forensic value is a side effect: ShellBags leave a breadcrumb trail of **every folder a user has ever opened**, including folders on removable drives, network shares, and even inside archive files — and that trail can survive long after the folder itself is gone.

- **Location:** `UsrClass.dat` (Windows 7 and later) under `Local Settings\Software\Microsoft\Windows\Shell\BagMRU` and `...\Shell\Bags`. Older systems keep some of this in `NTUSER.DAT` instead.
- **`BagMRU`** tracks the folder hierarchy itself (which folders were opened, and in what nested order).
- **`Bags`** tracks the view settings tied to each folder referenced in BagMRU.
- Folder paths are stored as binary shell item ID lists, not plain strings — this isn't something you read by eye in a registry viewer; it needs a dedicated parser.

## Normal baseline

Entries reflecting the user's ordinary folder-browsing habits — Documents, Downloads, project folders, and so on — consistent with their role and normal day-to-day file access.

## Red flags

- ShellBags referencing folders on a **removable or external volume** that isn't otherwise accounted for in the investigation — this is one of the few artifacts that can prove a specific folder structure existed on a USB drive that's since been disconnected, reformatted, or lost.
- Evidence of browsing to **another user's profile**, an administrative share, or a sensitive folder outside the user's normal scope of work.
- A folder structure consistent with staging data for exfiltration (a newly created, oddly-named folder under a user profile, browsed shortly before a large outbound transfer).

!!! success "Baseline"
    Folder access consistent with the user's normal role and known devices.

!!! danger "Red flag"
    Browsing history for removable media, other users' data, or administrative locations with no legitimate reason.

## How to collect it

Pull `UsrClass.dat` (and `NTUSER.DAT` for older data) from the user's profile during triage. Eric Zimmerman's `ShellBags Explorer` is the standard tool — it decodes the binary shell item structures into a readable folder tree with timestamps.

## ATT&CK mapping

Data source supporting [T1083 (File and Directory Discovery)](https://attack.mitre.org/techniques/T1083/) and, in insider-threat scenarios, general proof of access to or knowledge of a specific location.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 1: Windows Endpoint Forensics](index.md)
- [Playbook: Data Exfiltration](../08-playbooks/data-exfiltration.md)
- [Playbook: Insider Threat](../08-playbooks/insider-threat.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500 — registry/shell artifact analysis)
- Eric Zimmerman's forensic tools (ShellBags Explorer)
