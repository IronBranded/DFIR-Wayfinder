Every investigation in this academy ends in a document somebody acts on. Two documents, usually — the same finding written for two audiences who need different things from it, and writing one when you needed the other is a common way for good technical work to produce no outcome.

## What each audience needs

**The engineer who has to fix it** needs: what happened, on which systems, the evidence supporting each claim, timestamps in **UTC**, artifact paths and hashes, how to reproduce the finding, and the specific remediation steps. Precision matters more than brevity.

**The executive who has to decide something** needs four answers, and usually only four:

1. **Is it over?**
2. **What was taken?**
3. **What do we have to tell whom, and by when?**
4. **What does fixing it cost, and what happens if we don't?**

Everything else is supporting detail. An executive summary that opens with the intrusion vector rather than the answer to question 1 has buried the point.

## Bottom line up front

Answer the question in the first sentence. Not context, not methodology, not chronology — the finding. Detail follows for those who want it; the decision-maker who reads only the first paragraph should still leave with the correct picture.

## Confidence language

Be explicit and consistent, and use the same vocabulary every time:

| Term | Means |
|---|---|
| **Confirmed** | Direct evidence supports this |
| **Likely** | Evidence supports this; alternatives are less consistent with it |
| **Possible** | Consistent with evidence but not distinguished from alternatives |
| **No evidence** | We looked and found nothing — *not* the same as "it didn't happen" |

> [!IMPORTANT]
> Never state a hypothesis as fact. The moment a report says "the attacker exfiltrated the customer database" when the evidence supports "the attacker accessed a system containing the customer database," the organization makes notification decisions on a claim that may not hold — and if it later fails, every other finding in the report becomes suspect too.

## Saying what you couldn't determine

Gaps belong in the report. Which log sources had already expired, which systems were rebuilt before collection, which questions the available evidence cannot answer.

This is not a weakness to minimize. [The exfiltration playbook's three-tier scope statement](#/lesson/l8-07-playbook-data-exfiltration) exists precisely because regulators generally treat unprovable scope as worst-case scope — so an explicit "we could not determine X because the proxy logs had already rotated" is more defensible, and often more favourable, than silence that reads as a claim.

It also directs the improvements that prevent the same gap next time.

## Timelines in reports

Every timestamp in **UTC**, with the timezone stated explicitly, per [timeline construction](#/lesson/l1-07-timeline-construction). A timeline whose timezone is unstated will be misread by someone, and mixed timezones in one table is among the easiest ways to make a correct investigation look wrong.

## Red flags in your own reporting

- **The answer buried below methodology and chronology.**
- **Technical detail in an executive summary**, or business framing substituted for evidence in a technical report.
- **Inconsistent or absent confidence language.**
- **Hypotheses presented as findings.**
- **No statement of what could not be determined.**
- **Local timestamps, mixed timezones, or unstated timezone.**

## Sources

- [NIST SP 800-61 — Computer Security Incident Handling Guide](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
