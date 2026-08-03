---
tags:
  - Playbook
---

# Playbook: Web Shell / Server Compromise

## Trigger

An EDR alert on an unusual child process of a web server worker process (`w3wp.exe`, `httpd`, `nginx`), an unfamiliar file appearing in a web-accessible directory, or unexpected outbound traffic originating from a server that should only ever receive inbound requests.

## Triage questions

- What application is running on this server, and does it have a known recent vulnerability (a CMS plugin, an unpatched framework version)?
- Is the server internet-facing?
- Has the shell been used to move laterally to other hosts?

## Data to pull

- Web server access logs for the request that likely dropped the shell (often a POST to an unusual path, or a file upload endpoint)
- [Prefetch](../01-windows-endpoint/prefetch.md) and [Amcache](../01-windows-endpoint/amcache.md) for anything executed through the shell
- [Process tree](../01-windows-endpoint/process-trees.md) data — specifically, the web worker process spawning `cmd.exe` or `powershell.exe` is the same category of anomaly as an Office application doing the same thing, and just as reliable a signal

## Analysis

Locate and preserve the shell file itself (often disguised with an innocuous name and extension matching the application's normal file types). Identify the vulnerability or misconfiguration that allowed it to be dropped in the first place — a web shell is a symptom, and cleaning it up without fixing the entry point just invites a repeat. Check for any lateral movement launched from the compromised server into the rest of the environment.

## Contain

Isolate the server from the network while preserving it for analysis rather than immediately powering it off — a live memory capture can be valuable if the shell or any loaded module is memory-resident. Block the malicious file from executing further if the server must stay online for business continuity in the short term.

## Eradicate

Remove the shell file, patch or otherwise remediate the vulnerability that allowed it, and rebuild the host if compromise appears extensive rather than trusting a clean-up of what's been found so far.

## Recover

Restore service only once the underlying vulnerability is confirmed patched — reintroducing the same unpatched application invites the same compromise again immediately.

## Lessons learned

Was this a known, patchable vulnerability that sat unaddressed, and if so, why? Would a Web Application Firewall have caught or blocked the exploit attempt? Is there monitoring on this class of server for exactly the process-tree anomaly that (hopefully) caught this?

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 8: Investigation Playbooks](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508/FOR610 — web shell and server-compromise analysis)
- NIST SP 800-61 Rev. 2 (see [Module 0](../00-foundations/ir-lifecycle.md) for the phase structure this playbook follows)
