This academy states plainly that it is built for enterprise DFIR rather than criminal prosecution. This lesson is where that distinction becomes operational: what actually needs documenting, what is genuinely load-bearing, and what is procedure inherited from a context this work is not operating in.

## What you are actually defending

In criminal forensics, the standard is **admissibility** — evidence must survive challenge in a courtroom under rules designed for that setting. In enterprise IR, the standard is **defensibility**: your findings must survive scrutiny from executives making expensive decisions, from regulators asking what was accessed, from insurers, from opposing counsel in civil matters, and from your own colleagues six months later trying to reproduce your work.

That is a real standard, not a lower one. It just cares about different things.

## What is genuinely load-bearing

**Hash everything on collection.** A SHA-256 taken at acquisition, recorded, and re-verified before analysis proves the artifact did not change in your custody. This costs seconds and is the single highest-value habit here.

**Work on copies, never originals.** Analysis modifies things. Keep an untouched original.

**Record who, what, when, and with what.** Tool name, tool **version**, operator, timestamp, source host, destination. The tool version matters more than people expect — parsers have bugs, and "which version produced this output" is a real question when a finding is challenged.

**Preserve, then analyze.** Collection order follows [order of volatility](#/lesson/l1-02-order-of-volatility), and collection completes before analysis begins.

**Document your reasoning, not just your findings.** "I concluded X because artifacts A and B agreed and C was absent" is reproducible. "X happened" is not.

## Chain of custody, enterprise version

A chain of custody in this context is **a documented record of who held what, when, and what they did with it**. It is a log, and it is genuinely necessary — it is what lets you answer "could this have been altered?" months later.

What it usually is *not*, in enterprise work: sealed tamper-evident bags, signed physical transfer forms, and a locked evidence room, for an artifact that was a cloud audit log export downloaded over an API. Applying the physical-evidence apparatus to a JSON file is procedure without purpose.

> [!IMPORTANT]
> The distinction is not "enterprise means less rigour." It is that rigour should attach to the things that can actually go wrong here. The realistic failure mode in enterprise DFIR is not inadmissible evidence — it is an **unreproducible finding** that collapses when someone asks how you reached it.

## The handoff point

Some incidents stop being purely internal. When an incident may become a law-enforcement matter, an employment-law matter, or civil litigation:

- **Stop and involve Legal before continuing.** This is not a delay; it is what prevents the work being wasted.
- **Do not continue collecting in a way that could contaminate** what a stricter process would require.
- **Preserve what you have** exactly as it is.

[Insider threat investigations](#/lesson/l8-06-playbook-insider-threat) start on the far side of this line — Legal and HR are co-owners from the first hour, precisely because the output is likely to support an employment decision.

## Normal baseline for a mature practice

Collection is scripted or tooled rather than ad hoc, so it is consistent between analysts and incidents. Hashes are recorded automatically at collection. Tool inventory with versions is maintained. There is a documented, pre-agreed trigger for escalating to Legal, decided before an incident rather than during one.

## Red flags in your own process

- **Analysis performed on the only copy** of an artifact.
- **No hash recorded at collection**, making later integrity claims unprovable.
- **Findings documented without the reasoning** that produced them.
- **Legal involved after a case has already turned into a personnel or litigation matter** rather than at the point it became foreseeable.
- **Collection procedure that varies by whichever analyst happened to respond.**

## Sources

- [NIST SP 800-86 — Guide to Integrating Forensic Techniques into Incident Response](https://csrc.nist.gov/publications/detail/sp/800-86/final)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
