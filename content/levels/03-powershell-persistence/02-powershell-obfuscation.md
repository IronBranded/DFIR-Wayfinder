The previous lesson established where PowerShell's own logging captures activity, and that Script Block Logging in particular hands you a post-parse, largely de-obfuscated script for free. This lesson covers the cases where you're still looking at something unreadable — a raw command line before it's parsed, a 4103 module-logging entry without the matching 4104 body, or an environment where Script Block Logging genuinely isn't enabled — and the specific techniques that produced it.

## `-EncodedCommand`: the one to recognize first

PowerShell accepts a command as a Base64-encoded string via the `-EncodedCommand` (or `-e`, `-enc`) parameter — and critically, the string isn't encoded from plain ASCII, but from **UTF-16LE** ("Unicode") text. Decoding it is a two-step process, and skipping the second step is the single most common mistake:

```
$encoded = "cABvAHcAZQByAHMAaABlAGwAbAAgAGkAcwAgAHIAdQBuAG4AaQBuAGcA"
$bytes = [System.Convert]::FromBase64String($encoded)
[System.Text.Encoding]::Unicode.GetString($bytes)
```

Base64-decoding alone produces garbled output with null bytes between every character — that's the UTF-16LE encoding showing through, not corruption. The `Unicode.GetString()` step (PowerShell's `Encoding.Unicode` is UTF-16LE specifically) is what actually recovers readable text — the example above decodes to `powershell is running`.

> [!LAB]
> Run the three lines above yourself. Then try decoding a `-EncodedCommand` value from a real sample you have lawful access to, or a public malware-analysis writeup — the two-step process is the same every time, and it's worth doing by hand at least once before relying on a tool to do it for you.

## Layered obfuscation: compression on top of encoding

Base64 alone is trivial to spot and decode, so a second layer is common: the plaintext is compressed with `System.IO.Compression.GzipStream` or `DeflateStream` before being Base64-encoded, meaning the decode process above yields compressed binary data rather than readable text, requiring a matching decompression step before anything is legible.

## String-reconstruction tricks

Beyond encoding and compression, PowerShell's own syntax offers several ways to assemble a string (or a whole command) from pieces too small or too scrambled for a naive string-matching rule to flag:

- **Concatenation and the format operator** — building a flagged string like `IEX` out of `'I' + 'E' + 'X'`, or via `'{0}{1}{2}' -f 'I','E','X'`.
- **Backtick-splitting** — inserting PowerShell's escape character inside a keyword (`` I`EX ``), which the parser silently ignores but which breaks an exact-string detection rule.
- **Character-array and case-randomization tricks** — reconstructing text from `[char]` values, or randomizing capitalization to evade case-sensitive matching (PowerShell itself is case-insensitive, so this costs the attacker nothing functionally).

## Framework-based obfuscation

**Invoke-Obfuscation** (and similar public frameworks) automate the tricks above at scale, applying them at the token or AST (abstract syntax tree) level rather than by hand. Its output has a recognizable shape — dense backtick-splitting, layered `-f` format strings, and compression-then-encoding stacking used together rather than in isolation — worth being able to recognize as "this came out of an obfuscation framework" even without reversing every step.

## The practical decode workflow

For anything beyond a single Base64/UTF-16LE layer, working by hand gets slow fast. **CyberChef** — a browser-based recipe-chaining tool — handles this well: a "From Base64" operation followed by "Decode text (UTF-16LE)" recovers the simple case, and additional "Gunzip" or "Raw Inflate" operations slot in ahead of the decode step when compression is layered on top. Chain the recipe once, and it decodes the next sample from the same campaign automatically.

> [!PLAIN]
> A "recipe" in CyberChef is just a saved sequence of operations, applied top to bottom — think of it as a small, reusable, GUI-built decoding script you never have to write code for.

## Normal baseline

`-EncodedCommand` isn't inherently malicious — some legitimate deployment tools (parts of SCCM/Intune script delivery, some third-party RMM tooling) use it specifically to avoid quoting and escaping problems when passing complex commands through several layers of shell invocation. The baseline is knowing which management tools in your environment legitimately generate encoded commands, from which parent processes and paths, so an encoded command from an unexpected source stands out against that context rather than against "encoded commands exist at all."

## Red flags

- **`-EncodedCommand` combined with `-WindowStyle Hidden` and/or `-NoProfile`** in the same invocation — legitimate management tooling rarely needs to hide its own window.
- **More than one obfuscation layer stacked together** — compression under encoding under string-reconstruction. Legitimate tooling almost never nests this deeply; it costs effort with no operational benefit except evasion.
- **Decoded content matching an Invoke-Obfuscation-style structural fingerprint**, even before understanding what the payload itself does.
- **A decoded payload that turns out to be a download cradle or reflective-execution pattern** — see the [malicious cmdlet patterns lesson](#/lesson/l3-04-powershell-malicious-patterns) for what that looks like once decoded.

> [!WARNING]
> Readable and undecoded are not the same as benign. Obfuscation raises suspicion, but its *absence* doesn't clear a command either — plenty of damaging one-liners are never obfuscated at all because their author didn't expect anyone to be reading logs.

## How to collect it

The encoded string itself typically surfaces in the process command line — Event ID 4688 (with command-line auditing enabled) or Sysmon Event ID 1. Both have a practical limitation worth knowing: very long command lines can be truncated depending on log configuration and collection method, silently cutting off part of the encoded blob. When that happens, the [Script Block Logging event (4104)](#/lesson/l3-01-powershell-logging) is the more reliable source, since it captures the full script text rather than a length-limited command-line field.

## ATT&CK mapping

Maps to [Obfuscated Files or Information (T1027)](https://attack.mitre.org/techniques/T1027/) for the encoding/compression/string tricks themselves, and [Deobfuscate/Decode Files or Information (T1140)](https://attack.mitre.org/techniques/T1140/) for the analyst-side skill this lesson covers — both sit underneath the same [PowerShell (T1059.001)](https://attack.mitre.org/techniques/T1059/001/) execution technique from the previous lesson.

## Sources

- [Microsoft Learn — about PowerShell Exe](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe)
- [MITRE ATT&CK — T1027: Obfuscated Files or Information](https://attack.mitre.org/techniques/T1027/)
- [CyberChef](https://gchq.github.io/CyberChef/)
