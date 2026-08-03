---
tags:
  - Cloud Identity
---

# Conditional Access in an Investigation

## What it does, and why the sign-in log is where you check it

Conditional Access policies are evaluated at the moment of sign-in — the sign-in log records exactly which policies applied to a given sign-in and what each one decided: **Success** (requirements satisfied), **Failure** (requirements not met, sign-in blocked), or **Not Applied** (the policy's conditions didn't match this sign-in at all — wrong user group, wrong app, wrong location, and so on).

That last state is the one most worth double-checking during an investigation: a "Not Applied" result for a policy you *expected* to cover the sign-in in question usually means a scoping gap, not a bypass — but it's worth confirming which, since the practical effect on the account is identical either way.

## Two things worth checking specifically

**Was the policy actually enforcing, or only reporting?** Conditional Access supports a "Report-only" mode specifically for testing new policies before turning on enforcement — a common and easy-to-miss misconfiguration is a policy that was meant to be protecting an account sitting in report-only mode indefinitely, generating log data about what *would* have happened without ever actually blocking anything. If a sign-in "should have" been stopped by a policy and wasn't, checking the policy's actual state (Enforced vs. Report-only) is one of the first things to rule out.

**Did the sign-in use a protocol Conditional Access can't evaluate?** Legacy authentication protocols (older POP, IMAP, and some legacy Exchange ActiveSync implementations) predate modern Conditional Access and, in environments where they're still permitted, can authenticate without most CA policies ever being able to evaluate them at all — not a bypass of the policy's logic, but a path that was never subject to it in the first place. Disabling legacy authentication is one of the highest-leverage hardening steps precisely because it closes this class of gap outright rather than requiring policy tuning.

!!! danger "Red flag"
    A successful sign-in with no Conditional Access policies applied where several should have matched, a relevant policy discovered to be in Report-only rather than Enforced mode, or successful authentication via a legacy protocol that bypasses modern policy evaluation entirely.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 6: Cloud Identity (Entra ID / Hybrid)](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR509 — cloud identity forensics)
