# Module 4: PowerShell Forensics

PowerShell is the single highest-leverage execution surface on modern Windows: it's trusted, pre-installed, deeply capable, and — critically — able to run entirely in memory. A script that never touches disk never generates a Prefetch entry, never gets an AV file-scan hit, and leaves no artifact for [Module 1](../01-windows-endpoint/index.md)'s filesystem techniques to find. This module is about the logging and analysis techniques that work anyway.

## Building now

- [ ] The four logging mechanisms: Module Logging (Event ID 4103), Script Block Logging (4104), Transcription, and the legacy Engine (400/403) and Pipeline (800) events — what each captures and how to enable them via GPO
- [ ] Reading a decoded 4104 event and knowing what "normal" admin scripting looks like
- [ ] Obfuscation-to-decode walkthrough: `-EncodedCommand` / Base64, compression (gzip + Base64), character-code obfuscation, string-splitting/concatenation, backtick insertion
- [ ] AMSI: what it inspects, where it sits in the execution path, and the detection-side signatures for known bypass *attempts*
- [ ] PowerShell version-downgrade attacks (why a `powershell -version 2` invocation is itself a red flag)
- [ ] Constrained Language Mode — what it restricts and how to detect attempts to escape it
- [ ] Common malicious-pattern cmdlets to alert on: `IEX` / `Invoke-Expression` piped from a download, `Net.WebClient` / `Invoke-WebRequest` to non-standard destinations, `System.Reflection.Assembly`-based in-memory loading

!!! tip "How this module is scoped"
    Everything here is written for the defender reading logs and memory captures after the fact, or building detections ahead of time — not for writing evasive PowerShell. Where offensive technique *categories* are named (AMSI bypass, downgrade attacks), the content stops at "here's the detection signature," consistent with every other module in this guide.
