---
tags:
  - Playbook
---

# Playbook: Insider Threat

## Trigger

A DLP alert on unusual data movement, an HR or Legal referral (often tied to a departing employee or a workplace dispute), or an access pattern clearly outside someone's normal baseline — after-hours access to systems unrelated to their role, for example.

This playbook is procedurally different from the others in this catalog: it usually can't proceed on purely technical authority. Coordinate with HR and Legal early, since employment law, union agreements, and evidentiary standards for potential termination or litigation vary by jurisdiction and can constrain what technical action is appropriate and when.

## Triage questions

- What does this person's *normal* access and data-handling pattern look like, and how does current activity compare?
- Is there a relevant employment context (resignation notice, performance action, role change) that changes the read on this activity?
- Is there evidence of deliberate data staging — collecting files into one location ahead of a transfer?

## Data to pull

- [ShellBags](../01-windows-endpoint/shellbags.md) for evidence of browsing to unusual locations (shared drives, other users' folders)
- [USN Journal](../01-windows-endpoint/usn-journal.md) for mass file-copy or file-collection activity in a short window
- DLP / [Defender for Cloud Apps](../07-defender-suite/index.md) logs for uploads to personal cloud storage or unusual external destinations
- USB device connection history (`HKLM\SYSTEM\CurrentControlSet\Enum\USBSTOR`) and print logs, where relevant to the suspected activity

## Analysis

Build a factual timeline of data access and movement, and stay strictly behavioral — describe what the data shows without asserting motive or intent that the evidence doesn't directly support. Correlate against the relevant employment timeline (notice date, last working day) where one exists, since data-handling risk often concentrates in that window.

## Contain

Technical containment (restricting access, disabling accounts) in an insider case usually needs to be coordinated with HR/Legal on timing — acting unilaterally can complicate both the employment process and any later legal proceeding. Preserve evidence forensically from the outset, since insider cases are disproportionately likely to end up in litigation or a formal disciplinary process where evidentiary rigor matters more than in a typical external-attacker incident (see [Evidence Handling](../00-foundations/evidence-handling.md)).

## Recover

Standard offboarding hardening once the situation is resolved: full access revocation, credential rotation for any shared systems, review of what the person had access to versus what they needed.

## Lessons learned

Was access provisioned on a least-privilege basis, or did this person have standing access to data with no clear business need? Was offboarding (for a departure-related case) executed promptly relative to the notice date, or did a gap leave a window for this activity?

<!-- BACKLINKS:START -->
## Referenced From

- [Playbook: Data Exfiltration](data-exfiltration.md)
- [Module 8: Investigation Playbooks](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508/FOR500 — insider investigation methodology)
- [Evidence Handling & Chain of Custody](../00-foundations/evidence-handling.md) — this playbook's evidentiary rigor draws directly from that page's enterprise-vs-legal framing
