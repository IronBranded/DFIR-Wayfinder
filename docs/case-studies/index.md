---
tags:
  - Case Study
---

# Case Studies

Every Playbook in this guide tells you what to pull and what questions to ask. Neither tells you what the reasoning between those questions actually looks like — why finding X sends you to check Y specifically, how you catch a timestamp lying to you, or how much corroboration is actually enough before you act. That connective reasoning is the investigative mindset, and a checklist structure can't model it by itself. These case studies exist to show it directly: one continuous investigation each, narrated at the point-by-point level, including the moment a naive read of the data would have led somewhere wrong.

Both case studies are original and synthetic — built specifically to exercise techniques already sourced on their linked reference pages, not drawn from any real incident.

## Available case studies

| Case Study | The central lesson | Ties to |
|---|---|---|
| [Domain Compromise, End to End](domain-compromise-case-study.md) | Clock skew between hosts can flip your read on an attack from "automated tooling" to "human operator" — and how you catch it using an independently-timestamped calibration event | [Timeline Construction](../00-foundations/timeline-construction.md), [DCSync Detection](../02-active-directory/dcsync-detection.md), [Domain Compromise playbook](../08-playbooks/domain-compromise.md) |
| [Business Email Compromise, End to End](bec-case-study.md) | A negative search result from a log with known ingestion latency isn't a clean bill of health — it might just be too early to ask | [Timeline Construction](../00-foundations/timeline-construction.md), [Sign-In vs. Audit Logs](../06-cloud-identity/sign-in-vs-audit-logs.md), [BEC playbook](../08-playbooks/business-email-compromise.md) |

!!! tip "Read these after, not instead of, the reference pages"
    Every specific fact used in these narratives — an event ID, a GUID, a retention window — is explained properly on the page it links to. These case studies assume you've been there already; their job is showing what it looks like to *use* that knowledge under time pressure, not to re-teach it.

<!-- BACKLINKS:START -->
## Referenced From

- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

