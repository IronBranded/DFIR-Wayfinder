Phishing is the most common initial-access vector in enterprise intrusions, which makes this the playbook run most often — and the one where the deciding judgment is when a single reported email stops being a helpdesk ticket and becomes an organization-wide search.

## Trigger

A user reports a suspicious message. A mail security product quarantines something and flags it for review. A credential-harvesting page is reported by a third party. Multiple users report the same message within a short window — which is itself a scoping signal, not just a louder trigger.

## First hour

**1. Get the original, not a forward.** A forwarded copy loses the original headers, and headers are where the [authentication results and routing path](#/lesson/l6-07-email-headers-authentication) live. Ask for it as an attachment, or pull it from the mailbox directly.

**2. Determine what the message was actually trying to do.** Three broad cases, with very different follow-ups: credential harvesting (a link to a fake login page), malware delivery (an attachment or a download link), or pure social engineering with no payload (invoice fraud, gift-card requests).

**3. Identify every recipient.** Message trace across the tenant, by sender, subject, and any URL in the body. The reporting user is almost never the only recipient.

## The escalation decision

One reported email stays a contained ticket if nobody interacted with it. It becomes an organization-wide incident the moment any of the following is true:

- **Anyone submitted credentials.** Every submitter is now a potential [BEC case](#/lesson/l8-03-playbook-bec) and needs session revocation, not just a password reset.
- **Anyone executed a payload.** That host now needs endpoint triage — [process tree](#/lesson/l2-10-process-trees) and [PowerShell logging](#/lesson/l3-01-powershell-logging) review at minimum.
- **The message bypassed controls that should have caught it**, which means the next one will too.

## Scoping

Who received it, who opened it, who clicked, who submitted — these are four different populations of decreasing size and increasing severity, and conflating them either overstates the incident or misses victims. Click telemetry (from mail security or proxy logs) distinguishes the middle two; only the phishing infrastructure knows who actually submitted, so treat every clicker as a possible submitter unless you can prove otherwise.

## Containment

Purge the message tenant-wide, not just from the reporting mailbox. Block the sender, the sending infrastructure, and any URLs at the mail gateway and proxy. Reset credentials for confirmed and suspected submitters, with session revocation.

## Closure criteria

All recipients identified and the message purged. All clickers triaged. All submitters reset with sessions revoked. Indicators blocked. If the message bypassed a control that should have stopped it, that gap is documented as a finding rather than closed with the ticket.

## Common mistakes

- Working only from a forwarded copy and losing the headers.
- Handling only the reporting user's mailbox.
- Treating "clicked" and "submitted credentials" as the same thing, in either direction.
- Closing the incident without addressing why the message was delivered in the first place.

## ATT&CK mapping

[Phishing (T1566)](https://attack.mitre.org/techniques/T1566/), with sub-techniques for [Spearphishing Attachment (T1566.001)](https://attack.mitre.org/techniques/T1566/001/) and [Spearphishing Link (T1566.002)](https://attack.mitre.org/techniques/T1566/002/).

## Sources

- MITRE ATT&CK — T1566: Phishing
- [Microsoft Learn — Investigate malicious email](https://learn.microsoft.com/en-us/defender-office-365/investigate-malicious-email-that-was-delivered)
