Every other playbook in this level starts inside the network. This one starts at its edge — on an internet-facing server that, by design, accepts and executes requests from anyone. The evidence is different, the timeline is usually longer than anyone expects, and the closure criterion is one most teams get wrong.

## What a web shell actually is

A script placed in a web-accessible directory that accepts commands over HTTP and executes them on the server, in the context of the web server process. It needs no persistence mechanism, no callback, and no port: the web server is already listening, already authorized, and already running. That is what makes it both simple and durable.

## Trigger

Unexpected outbound connections from a web server. Antivirus or [Defender detecting a file in a web root](#/lesson/l2-05-defender-av-mechanics). A third-party notification. Unusual CPU on a server that should be mostly idle. Or, commonly, a finding during unrelated investigation of something the web server did on the internal network.

## The near-definitive endpoint signal

**`w3wp.exe` spawning `cmd.exe` or `powershell.exe`** is about as close to a definitive indicator as endpoint forensics offers. IIS worker processes serve web content; they have no legitimate reason to spawn a command interpreter. The same logic applies to `httpd`, `nginx`, and `java` on other stacks. This is the [baseline process tree](#/lesson/l3-04-process-trees) reasoning from Level 2 applied to a server role, and it usually finds the shell faster than scanning the web root does.

## Web server log analysis

IIS logs (`C:\inetpub\logs\LogFiles\`) are the timeline source, and a few patterns matter:

- **Repeated POST requests to a single unusual URI**, often one that doesn't correspond to any known application page.
- **A single source address interacting with only that URI** and nothing else on the site.
- **Requests with unusually long query strings or bodies** — commands and encoded output travelling in and out.
- **The first request to that URI ever**, which dates the shell's activation and anchors the timeline.

Because IIS logs are written per-request and retained by default, they frequently reach back further than the Security log — often the only source that can establish how long the shell has been there.

## Scoping

Timeline the web root: file creation and modification times across all web-accessible directories, looking for files that postdate the last legitimate deployment. Web shells are often small, plausibly named, and placed among hundreds of legitimate files, so deployment-date comparison beats visual inspection.

Then work in both directions. **Backwards** to the initial vulnerability — an unpatched application, an upload feature without validation, stolen credentials to a management interface. **Forwards** to what the shell was used for: credential access on the server, lateral movement inward, data staged for egress.

## The closure criterion most teams get wrong

**Deleting the shell is not remediation.** If the vulnerability that permitted the file to be written is still present, the shell comes back — often within hours, sometimes with a different name in a different directory. The incident is not closed when the file is gone; it is closed when the write path is closed.

## Closure criteria

Initial access vector identified and remediated. All web-accessible directories reviewed against a known-good deployment, not just the directory the shell was found in. Server credentials rotated, including any service accounts and any application connection strings. Lateral movement from the server scoped. Monitoring in place for recurrence at the same entry point.

## Common mistakes

- Deleting the shell without finding the write path.
- Reviewing only the directory where the first shell was found — multiple shells in multiple locations is the norm, not the exception.
- Treating it as a single-server incident when the server had credentials or network reach into the internal environment.
- Assuming the shell is recent, when IIS logs often show it predating discovery by months.

## ATT&CK mapping

[Server Software Component: Web Shell (T1505.003)](https://attack.mitre.org/techniques/T1505/003/), typically following [Exploit Public-Facing Application (T1190)](https://attack.mitre.org/techniques/T1190/).

## Sources

- MITRE ATT&CK — T1505.003, T1190
- [Microsoft Security — Web shell attacks continue to rise](https://www.microsoft.com/en-us/security/blog/2021/02/11/web-shell-attacks-continue-to-rise/)
