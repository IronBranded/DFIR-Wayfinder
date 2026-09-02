Email headers are the primary evidence in every phishing and BEC investigation, and the single most common analytical error is treating "SPF passed" as "this message is legitimate." Understanding why that inference is wrong requires knowing which address each mechanism actually checks.

![Which address each email authentication mechanism checks: SPF validates Return-Path, DKIM signs for its own d= domain, and only DMARC requires alignment with the From header the user actually sees](assets/img/diagrams/email-spoofing-triangle.svg)

## Reading the Received chain

Received headers are **prepended** by each hop, so the chain reads **bottom-up**: the oldest hop is at the bottom, the most recent at the top.

The critical qualification: **only the headers added by infrastructure you control are trustworthy.** Everything below the point where your gateway took over was written by systems you do not operate, and an attacker can fabricate as many plausible-looking Received headers as they like before sending. Identify your trust boundary first, then read upward from it.

## The spoofing triangle

Three different addresses, three different purposes, and the confusion between them is the entire basis of email spoofing:

| Header | What it is | Who sees it |
|---|---|---|
| **`From:`** | RFC 5322 header From — the display address | **The user** |
| **`Return-Path`** | RFC 5321 envelope sender (MAIL FROM) | Mail servers; bounces go here |
| **`Reply-To:`** | Where replies are addressed | Nobody, until they hit reply |

The classic BEC construction uses all three: `From:` shows the CEO's real address, `Return-Path` is the attacker's own domain, and `Reply-To:` quietly redirects the victim's response to attacker-controlled infrastructure. The user checks the sender, sees the right name, and replies into the attacker's inbox.

## What each authentication mechanism actually checks

**SPF** checks whether the sending IP is authorized by the DNS records of the **`Return-Path` domain** — the envelope sender. It says nothing whatsoever about the `From:` header the user sees.

> [!WARNING]
> An attacker sending from `attacker-domain.com` with a perfectly configured SPF record will **pass SPF**, while displaying `From: ceo@yourcompany.com`. SPF passed, and it means only that the attacker's own domain authorized their own server. "SPF pass" is not "not spoofed."

**DKIM** applies a cryptographic signature over selected headers and the body. A valid signature proves the domain in the **`d=` tag** authorized the message and that the signed content was not modified in transit. Again — the `d=` domain need not be the `From:` domain.

**DMARC** is the mechanism that closes the gap. It requires that SPF or DKIM not only **pass** but also **align** with the `From:` domain the user actually sees. Alignment can be **relaxed** (organizational domain match) or **strict** (exact match), and the policy — `none`, `quarantine`, or `reject` — determines what receivers do on failure.

**DMARC is the only one of the three that protects the header the user reads.** That is the sentence worth carrying out of this lesson.

## Microsoft 365 specifics

M365 writes its verdict into the `Authentication-Results` header, including a **composite authentication (`compauth`)** value — `pass`, `fail`, `softpass`, or `none` — with a numeric reason code. Composite authentication blends SPF, DKIM, DMARC, and Microsoft's own sender reputation signals into a single judgement, which is often more useful than reading the three individually, particularly for domains with no DMARC policy at all.

## Normal baseline

Legitimate mail from partners passes DMARC with alignment. `From:`, `Return-Path`, and `Reply-To:` domains agree, or differ in ways explained by a known mail service. Received chains show plausible routing consistent with the sending organization.

## Red flags

- **`Reply-To:` differing from `From:`**, especially to a lookalike or free-mail domain.
- **DMARC fail or absent** on a message claiming to be from a partner who normally passes.
- **SPF pass with a `Return-Path` domain unrelated to the `From:` domain** — the misreading trap above.
- **A DKIM `d=` domain unrelated to the `From:` domain.**
- **A Received chain with implausible timing or geography**, or hops below your trust boundary claiming infrastructure that does not exist.
- **A lookalike `From:` domain** — homoglyphs, added hyphens, alternate TLDs.

## How to collect it

Obtain the **original message**, not a forward — forwarding replaces the headers with the forwarder's own, destroying exactly the evidence you need. Request it as an attachment (`.eml`/`.msg`) or pull it from the mailbox directly. This is also the first step in [the phishing playbook](#/lesson/l8-02-playbook-phishing).

## ATT&CK mapping

[Phishing (T1566)](https://attack.mitre.org/techniques/T1566/), [Impersonation (T1656)](https://attack.mitre.org/techniques/T1656/).

## Sources

- [RFC 7489 — DMARC](https://www.rfc-editor.org/rfc/rfc7489)
- [Microsoft Learn — Anti-spam message headers](https://learn.microsoft.com/en-us/defender-office-365/message-headers-eop-mdo)
