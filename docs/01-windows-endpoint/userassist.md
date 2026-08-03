---
tags:
  - Windows Endpoint
  - T1204
---

# Artifact: UserAssist

## What it is / where it lives

UserAssist tracks programs launched through the Windows GUI shell — double-clicking a shortcut, launching from the Start Menu — which makes it a useful complement to artifacts like Prefetch and Amcache that capture execution more broadly, including command-line and scripted launches.

- **Location:** `NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Explorer\UserAssist\{GUID}\Count`
- Entries are organized under several GUID-named subkeys, each representing a different category of shell-initiated activity (one bucket for shortcut/Start Menu launches, another for direct executable launches, and so on).
- **Every value name is ROT13-encoded** — the literal path or program identifier is rotated by 13 letters, a deliberate (if mild) obfuscation that any UserAssist-aware parser reverses automatically.
- Each entry stores a run count and a last-execution timestamp; newer Windows versions also track a focus count/focus time reflecting how long the window held focus.

## Normal baseline

Entries matching the software a user is known to regularly use, launched via the Start Menu or desktop/taskbar shortcuts, with run counts consistent with their actual usage patterns.

## Red flags

- After ROT13 decoding, an entry referencing a tool inconsistent with the user's role — especially administrative, remote-access, or offensive-security tooling on a standard user workstation.
- Execution from an unusual GUI-browsed location (a temp folder, a downloads subfolder) rather than a standard install path.
- A discrepancy between what a user *claims* they did and what UserAssist shows — for example, a user denying ever manually launching a tool that UserAssist records as GUI-launched multiple times.

!!! success "Baseline"
    Decoded entries matching known, role-appropriate software with plausible run counts.

!!! danger "Red flag"
    Decoded entries showing unexpected tooling, launched from unusual locations, or contradicting a user's account of their own activity.

## How to collect it

Pull `NTUSER.DAT` from the relevant user profile during triage. Eric Zimmerman's `RECmd` (with its UserAssist-specific batch definitions) or `Registry Explorer` will decode the ROT13 values automatically rather than requiring manual decoding.

## ATT&CK mapping

Data source supporting [T1204 (User Execution)](https://attack.mitre.org/techniques/T1204/) — specifically the GUI-initiated subset of execution evidence.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 1: Windows Endpoint Forensics](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500 — registry forensics)
- Eric Zimmerman's forensic tools (RECmd, Registry Explorer)
