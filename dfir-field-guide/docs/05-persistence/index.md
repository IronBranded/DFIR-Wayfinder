# Module 5: Persistence Catalog

Every persistence mechanism here is written once, tagged with its ATT&CK sub-technique, and linked to from wherever it's relevant — a playbook, an artifact page, a Defender detection. Nothing about persistence gets explained twice in this guide; this module is the single source of truth.

## Structure every entry follows

**Mechanism → ATT&CK ID → where the evidence lives → detection query/approach → cleanup**

## Building now — endpoint persistence

- [ ] Registry Run / RunOnce keys (T1547.001)
- [ ] Scheduled Tasks (T1053.005)
- [ ] Windows Services (T1543.003)
- [ ] WMI Event Subscriptions (T1546.003)
- [ ] COM Hijacking (T1546.015) & DLL Search-Order Hijacking (T1574.001)
- [ ] AppInit_DLLs / Image File Execution Options debugger hijack (T1546.010 / T1546.012)
- [ ] LSA Provider / Security Support Provider abuse (T1547.005)
- [ ] BITS Jobs (T1197)
- [ ] Winlogon Shell/Userinit modification (T1547.004)

## Building now — cloud/hybrid identity persistence

- [ ] Malicious OAuth application consent grants (T1098.003)
- [ ] Backdoor app registrations / service principals with excess API permissions
- [ ] Mailbox forwarding rules and delegate access (T1114.003)
- [ ] Federation trust / ADFS token-signing certificate abuse ("Golden SAML")
- [ ] Break-glass or emergency-access account abuse

Cloud persistence deserves equal billing with endpoint persistence in this catalog — an attacker who gets kicked off a host but left a mail-forwarding rule or an OAuth grant behind hasn't actually been evicted. See [Module 6's hybrid runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now) for the remediation order that accounts for this.
