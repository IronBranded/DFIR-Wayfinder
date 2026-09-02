[The previous lesson](#/lesson/l6-07-email-headers-authentication) covered the headers. This one covers the body: how a message is actually assembled, what the attachment is without opening it, and the mismatch between what a message displays and what it contains.

## MIME structure

A modern email is a tree of parts:

- **`multipart/alternative`** — the same content in two formats, typically `text/plain` and `text/html`. The client renders one and hides the other.
- **`multipart/mixed`** — body plus attachments.
- **`Content-Transfer-Encoding`** — usually `base64` or `quoted-printable`, which is why raw source looks unreadable.

## The mismatch that still works

Because `multipart/alternative` carries **two versions of the same message**, an attacker can put benign text in the `text/plain` part and the actual payload in the `text/html` part. Automated tooling that samples the plain-text part sees something harmless; the user sees the HTML.

The narrower and more common version of the same idea lives inside a single link:

```html
<a href="https://attacker.example/collect">https://portal.microsoft.com/login</a>
```

The displayed text and the `href` are different strings. Reading rendered mail hides this completely; reading source makes it obvious. It remains one of the most reliable phishing tells in active use.

## Attachments: identify before opening

**Hash first, always.** Extract the attachment without executing it, compute SHA-256, and check it against threat intelligence before anything else. Frequently that ends the analysis.

Filename tricks worth recognizing:

- **Double extensions** — `invoice.pdf.exe`, relying on hidden known extensions.
- **Right-to-left override (U+202E)** — an invisible Unicode character that reverses the *displayed* filename, so `invoice\u202Efdp.exe` renders as `invoiceexe.pdf`. The actual extension is unchanged.
- **Container formats** — `.iso`, `.img`, `.vhd`. These historically did not propagate [Mark of the Web](#/lesson/l7-05-alternate-data-streams) to their contents, stripping the mark that causes Office to block macros. That property drove a real shift in delivery tradecraft.

## URLs in the body

Check for shorteners masking the destination, **homoglyph and IDN domains** (Cyrillic characters that render identically to Latin ones), and redirect chains where the first hop is a legitimate, reputable service being used as a relay.

## Offline mailbox formats

Investigations frequently involve mail already exported or archived rather than live in a mailbox:

- **PST** — Outlook personal storage, often an export or archive.
- **OST** — the local cached copy of a mailbox, present on the endpoint even when server-side data is gone.
- **MBOX** — the common export format from non-Microsoft platforms.

**libpff** is the standard open-source parser for PST and OST. The OST case matters more than it looks: when a mailbox has been wiped server-side, the endpoint's OST may be the only surviving copy of what was in it.

## Normal baseline

Attachments match the sender's business relationship. MIME structures are unremarkable, with plain-text and HTML parts saying the same thing. Link display text matches its target. Attachment types match what the organization actually exchanges.

## Red flags

- **Display text and `href` disagreeing** in a link.
- **`text/plain` and `text/html` parts with materially different content.**
- **A container attachment** (`.iso`, `.img`, `.vhd`) from an external sender.
- **A right-to-left override character** anywhere in a filename.
- **A macro-enabled Office format** from a sender who has never sent one.
- **A shortened or IDN URL** in a message claiming to be from a known corporate sender.

## How to collect it

View the raw message source rather than the rendered message. Extract attachments to an isolated analysis environment — never by double-clicking from the mail client. Hash before opening. For deeper analysis of a confirmed-malicious attachment, that is the handoff point to [dedicated malware analysis](#/lesson/l5-10-malware-triage-methodology), which is deliberately outside this academy's scope.

## ATT&CK mapping

[Phishing: Spearphishing Attachment (T1566.001)](https://attack.mitre.org/techniques/T1566/001/) and [Spearphishing Link (T1566.002)](https://attack.mitre.org/techniques/T1566/002/).

## Sources

- [RFC 2045 — MIME](https://www.rfc-editor.org/rfc/rfc2045)
- MITRE ATT&CK — T1566.001, T1566.002
