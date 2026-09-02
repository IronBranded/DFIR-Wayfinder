Every lesson in this level has covered one link. This one is the chain.

Read individually, "Local Privilege Escalation," "Discovery," "Pass-the-Hash," and "Kerberos Delegation Abuse" can feel like an unordered catalog of unrelated techniques. They're not — in a real intrusion, they tend to happen in roughly this order, each stage's output becoming the next stage's input:

![Seven-stage diagram of an Active Directory attack chain: Initial Foothold, Local Privilege Escalation, Discovery, Credential Theft, Lateral Movement, Delegation Abuse/RBCD, Domain Compromise, color-coded teal to amber to red by severity](assets/img/diagrams/ad-attack-chain.svg)

## Why the order matters more than the individual techniques

Notice what each stage actually *produces* for the next one:

- **Local privilege escalation** doesn't get an attacker into AD — it gets them SYSTEM on *one host*. That's a prerequisite, not the goal.
- **Discovery**, run from that SYSTEM context, is what tells the attacker whether this host is worth anything — is there a privileged account's cached credential here, a delegation misconfiguration, a path toward a Domain Controller.
- **Credential theft** is where the intrusion actually becomes dangerous beyond one machine — LSASS access, Kerberoasting, or DCSync turns local access into something portable.
- **Lateral movement** spends that stolen credential material to reach a *different* host — and Pass-the-Hash/Pass-the-Ticket/NTLM Relay all work specifically because step 4 already succeeded.
- **Delegation abuse** is where AD's own trust model gets turned against itself — not forging anything yet, just redirecting who's allowed to act as whom.
- **Domain compromise** is the terminal state: a Golden Ticket or a full DCSync, reachable because every prior stage built toward exactly this.

> [!IMPORTANT]
> This is the common *shape*, not a fixed script. Real intrusions skip stages (a phished credential with Domain Admin rights might jump straight to stage 4), repeat them (discovery happens again at every new foothold, not once), or take a completely different path through the same seven ideas. The value of the chain isn't predicting exactly what happens next — it's recognizing *which stage you're looking at* when you find one piece of evidence, so you know what to look for on either side of it.

## Using this as an investigative tool, not just a study aid

When you find a single artifact mid-investigation — a Kerberoasting attempt, an unfamiliar RBCD configuration, a Pass-the-Ticket pattern — this chain answers two practical questions at once: **what almost certainly already happened** (everything to its left) and **what to check for next** (everything to its right). Finding stage 5 lateral movement without evidence of stage 4 credential theft is itself a finding — it means you're missing evidence, not that the chain doesn't apply.

## Recovery has to match the chain's depth

The remediation effort for an intrusion that reached stage 7 (domain compromise) is categorically different from one contained at stage 2 — this is exactly why the [krbtgt double-reset](#/lesson/l4-04-krbtgt-double-reset) exists as its own dedicated lesson: a Golden Ticket forged from krbtgt survives a single credential reset entirely, because krbtgt itself has to be invalidated twice, with a wait between resets, to actually close it. Scoping *how far* an intrusion travelled through this chain is what determines how far the recovery has to reach.

## Sources

- MITRE ATT&CK — Enterprise matrix, used throughout this level as the technique taxonomy
- [Microsoft Learn — Securing privileged access and the tiered access model](https://learn.microsoft.com/en-us/security/privileged-access-workstations/privileged-access-access-model)
- [Microsoft Security Blog — human-operated intrusion patterns (MSTIC)](https://www.microsoft.com/en-us/security/blog/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
