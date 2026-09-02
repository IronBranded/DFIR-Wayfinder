Every other playbook in this level starts with "how did they get in." This one doesn't, because they were already in — legitimately, with credentials issued to them on purpose. That single difference changes the investigative posture, the evidence that matters, and who owns the investigation.

## The posture shift

The question is not *whether access occurred* but **whether the access exceeded authorization**. A finance analyst opening finance records is not a finding. The same analyst opening them at 2am, at ten times their normal volume, two weeks before resigning, is a pattern — and the pattern only exists relative to a baseline of what that person normally does.

That makes peer and self comparison the core analytic technique here, rather than the anomaly detection used elsewhere in this academy.

## This playbook is not owned by IR alone

Insider investigations involve HR and Legal as co-owners from the first hour, not as later notifications. Practical consequences:

- **Get authorization before you start.** Monitoring an identified employee has legal implications that vary by jurisdiction and employment agreement. Technical capability is not authorization.
- **Timing is coordinated, not technical.** When access is revoked, when the subject is interviewed, and when the investigation becomes visible are decisions made jointly — revoking access early can destroy the opportunity to establish scope.
- **Document what you did not find.** In an investigation that may end in termination or litigation, the absence of evidence is itself a finding and needs recording as deliberately as any positive result.

> [!IMPORTANT]
> Confirmation bias is the specific risk in this playbook. An investigation launched because someone is *suspected* will surface ambiguous activity, and ambiguous activity looks incriminating when you're looking for incrimination. Establish the baseline before reviewing the subject's activity against it — not the other way round.

## Evidence that matters here

- **Removable media** — USB device history and what was written to it.
- **Cloud and web upload** — personal cloud storage, webmail, file-sharing services, via proxy logs and cloud audit logs.
- **Email to personal accounts** — including attachments, via message trace.
- **Printing** — routinely overlooked, and a common exfiltration route for exactly that reason.
- **Access volume and timing** — file and database access patterns compared against the subject's own history and their peers'.
- **Repository and system access** — bulk clones or exports of source code and customer data.

## Scoping

Establish the subject's normal baseline first, over a period predating any suspicion. Then compare the period of interest against it, and against peers doing the same job. The output is a difference, with dates — not a list of everything the person touched.

## Closure criteria

A documented, defensible evidence package handed to HR and Legal, stating what was found, what was not found, and the confidence in each. Access revoked on the coordinated timeline. Any exfiltrated data scoped for the [exfiltration playbook](#/lesson/l8-07-playbook-data-exfiltration) if notification obligations may apply.

## Common mistakes

- Beginning technical monitoring before legal authorization exists.
- Scope creep into activity that is personal rather than relevant.
- Reviewing the subject's activity without first establishing what normal looks like for them.
- Revoking access on IR's timeline rather than the coordinated one, and losing scope in the process.

## ATT&CK mapping

Insider activity maps awkwardly to ATT&CK, which models external adversaries — the closest fits are [Exfiltration Over Physical Medium (T1052)](https://attack.mitre.org/techniques/T1052/) and [Exfiltration Over Web Service (T1567)](https://attack.mitre.org/techniques/T1567/). The mismatch is itself worth understanding: a framework built around intrusion has limited vocabulary for someone who never had to intrude.

## Sources

- MITRE ATT&CK — T1052, T1567
- [CISA — Insider Threat Mitigation Guide](https://www.cisa.gov/resources-tools/resources/insider-threat-mitigation-guide)
