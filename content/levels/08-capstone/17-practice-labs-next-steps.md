Everything in this academy so far has been reading about evidence. This lesson is the honest acknowledgment of what reading about evidence can't fully teach you, and where to go get the other half — actual practice against real forensic artifacts, with your hands on real tools.

> [!IMPORTANT]
> This academy currently has no bundled sample evidence of its own — no practice `$MFT`, no sample memory image, no sample `.evtx` export. That's a real, acknowledged gap, not an oversight being hidden from you. The resources below are how to close it yourself, today, for free.

## Where to get real evidence to practice on

**Digital Corpora** (digitalcorpora.org) — realistic disk images, memory dumps, and network captures built specifically for forensics training and research, not staged toy examples. This is the single best starting point for applying Level 2's artifact lessons against something real.

**NIST CFReDS** (cfreds.nist.gov) — Computer Forensics Reference Data Sets, the distinguishing feature being **known answers**. You can check your own analysis against a documented correct result instead of just hoping you got it right, which matters enormously when you're teaching yourself.

**CyberDefenders** (cyberdefenders.org) — free, structured DFIR challenges organized into tracks that map closely onto this academy's own levels: disk forensics, memory forensics, network traffic analysis, log-based threat hunting. Built as CTF-style scenarios with a specific question to answer, which forces the same "reach a confident conclusion" discipline as real casework.

**SANS NetWars and the Magnet Virtual Summit CTF** — recurring, free or low-cost community events built around realistic, timed DFIR scenarios, run by the same community whose course material this academy draws from.

## Building a lab worth practicing in

A Windows VM with the tools this academy references throughout — MFTECmd, KAPE, Registry Explorer, Timeline Explorer, Volatility 3 — configured once, snapshotted clean, and reset between practice sessions. None of these tools require a license to use for training. The **Tool Directory** in this academy's Reference hub lists every one of them with a direct link.

> [!LAB]
> A concrete first exercise: download one Digital Corpora disk image, run MFTECmd against its `$MFT`, and find one file whose `$SI` and `$FN` creation times disagree by more than a few seconds. Explain *why*, using the Level 2 MACB lesson and the SI/FN Calculator in the Reference hub — a copy, a cross-volume move, or something worth flagging as a genuine red flag. That one exercise exercises the exact reasoning this entire academy has been building toward.

## What comes after this academy

This is deliberately not a closed loop. The realistic next steps, in roughly the order most people find useful:

1. **Pick a track from the Reference hub** (Incident Responder, Cloud & Hybrid Identity, or Domain Compromise) and go deeper on the specific pieces most relevant to your actual role, rather than treating every level as equally urgent.
2. **Work a CyberDefenders or Digital Corpora scenario end to end**, writing it up the way [Reporting & Communication](#/lesson/l1-11-reporting-communication) describes — both the technical and executive versions — not just reaching an answer privately.
3. **Consider a certification** if you want external validation of what you now know — see the previous lesson for how GIAC's certifications map onto what you've just covered.
4. **Keep this academy's Reference hub as a working desk reference**, not a one-time read — the Glossary, Tool Directory, and Quick Reference are built to be reopened mid-investigation, not just read once and closed.

There's no final exam here, and no certificate this site can issue you. The actual test is the next real investigation you're part of — this academy's job was making sure you walk into it recognizing what you're looking at.

## Sources

**Free datasets with known answers — the ones worth starting on:**

- [CyberDefenders](https://cyberdefenders.org/) — guided blue-team challenges with published solutions
- [Digital Corpora](https://digitalcorpora.org/) — realistic disk and memory images built for teaching
- [NIST CFReDS](https://cfreds.nist.gov/) — reference datasets with documented ground truth
- [DFIR Madness case studies](https://dfirmadness.com/) — full intrusion scenarios with images and walkthroughs
- [Ali Hadi's DFIR challenge images](https://www.ashemery.com/dfir.html)
- [MemLabs — memory forensics challenges](https://github.com/stuxnet999/MemLabs)

**Build your own lab:**

- [Microsoft Evaluation Center](https://www.microsoft.com/en-us/evalcenter/) — time-limited Windows Server and client ISOs
- [DetectionLab](https://github.com/clong/DetectionLab) — pre-instrumented AD lab with Sysmon and logging deployed
- [Atomic Red Team](https://atomicredteam.io/) — safe, scoped technique execution mapped to ATT&CK

**Competitive practice:**

- [SANS NetWars](https://www.sans.org/cyber-ranges/) and the Magnet Virtual Summit CTF

