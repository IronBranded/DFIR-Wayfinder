# manifest.json changes for l3-01 – l3-04

Files and quizzes are ready; the manifest entries still say `"status": "coming-soon"` with no `contentPath`/`quizPath`/`objectives`. Replace each of the four blocks below in `content/manifest.json` (Level 3 → `lessons[]`), then run `python3 scripts/validate.py` before committing — it will confirm the paths resolve and the quiz `lessonId` values match.

## l3-01-powershell-logging

```json
{
  "id": "l3-01-powershell-logging",
  "module": "PowerShell Forensics",
  "title": "PowerShell Logging",
  "summary": "Module logging, script block logging, and transcription -- three different log sources capturing three different slices of what actually ran, and why you usually need more than one turned on.",
  "estimatedMinutes": 20,
  "status": "ready",
  "tags": ["powershell", "logging", "t1059.001"],
  "contentPath": "content/levels/03-powershell-persistence/01-powershell-logging.md",
  "quizPath": "content/levels/03-powershell-persistence/01-powershell-logging.quiz.json",
  "objectives": [
    "Name the three PowerShell logging sources and what distinct slice of activity each one captures",
    "Explain why Script Block Logging (4104) defeats most obfuscation automatically, without additional decoding",
    "Locate PSReadLine's console history file and explain what makes it different from the event log sources",
    "Identify the GPO settings that must be explicitly enabled before this evidence exists, and why their absence is itself a finding"
  ]
}
```

## l3-02-powershell-obfuscation

```json
{
  "id": "l3-02-powershell-obfuscation",
  "module": "PowerShell Forensics",
  "title": "Obfuscation & Decoding",
  "summary": "-EncodedCommand, compression layers, and string-reassembly tricks decoded step by step -- the exact skill that turns an unreadable blob into a readable command.",
  "estimatedMinutes": 26,
  "status": "ready",
  "tags": ["powershell", "obfuscation", "decoding", "t1027"],
  "contentPath": "content/levels/03-powershell-persistence/02-powershell-obfuscation.md",
  "quizPath": "content/levels/03-powershell-persistence/02-powershell-obfuscation.quiz.json",
  "objectives": [
    "Decode a Base64/UTF-16LE -EncodedCommand payload by hand and explain why the encoding step is separate from any obfuscation layered on top of it",
    "Recognize compression, string-reconstruction, and framework-based (Invoke-Obfuscation-style) obfuscation patterns at a glance",
    "Explain why Script Block Logging often makes manual decoding unnecessary, and when manual decoding is still required",
    "Identify the command-line truncation limitation in process-creation logging and the log source that avoids it"
  ]
}
```

## l3-03-powershell-evasion

```json
{
  "id": "l3-03-powershell-evasion",
  "module": "PowerShell Forensics",
  "title": "Evasion Detection",
  "summary": "AMSI bypass patterns and the logging gaps attackers specifically target -- recognized at the detection-signature level, not built.",
  "estimatedMinutes": 20,
  "status": "ready",
  "tags": ["powershell", "evasion", "amsi", "t1562.001"],
  "contentPath": "content/levels/03-powershell-persistence/03-powershell-evasion.md",
  "quizPath": "content/levels/03-powershell-persistence/03-powershell-evasion.quiz.json",
  "objectives": [
    "Explain what AMSI is and at what point in PowerShell's execution pipeline it gets invoked",
    "Recognize the canonical reflection-based AMSI bypass pattern in a decoded script block",
    "Explain why -ExecutionPolicy Bypass is not a security boundary, and what it actually controls",
    "Identify a PowerShell v2 downgrade attempt and explain what logging capability it specifically evades"
  ]
}
```

## l3-04-powershell-malicious-patterns

```json
{
  "id": "l3-04-powershell-malicious-patterns",
  "module": "PowerShell Forensics",
  "title": "Malicious Cmdlet Patterns",
  "summary": "The specific cmdlets and argument patterns that show up in real intrusions constantly enough to be worth pattern-matching on sight.",
  "estimatedMinutes": 18,
  "status": "ready",
  "tags": ["powershell", "detection-patterns", "t1105"],
  "contentPath": "content/levels/03-powershell-persistence/04-powershell-malicious-patterns.md",
  "quizPath": "content/levels/03-powershell-persistence/04-powershell-malicious-patterns.quiz.json",
  "objectives": [
    "Recognize the download-cradle pattern (IEX combined with DownloadString/DownloadFile) and explain why it leaves so little on disk",
    "Name the specific Set-MpPreference/Add-MpPreference cmdlets used to tamper with Defender, and why they're a high-confidence indicator",
    "Explain how PowerShell's automation engine can execute without a powershell.exe process ever appearing in process-creation logs",
    "Distinguish an individually-benign flag (like -NoProfile) from the same flag appearing as part of a suspicious cluster"
  ]
}
```

## Not touched, but worth doing as a fast follow

- `l2-12-lolbins.md` and `l3-19-non-powershell-execution.md` are both natural candidates for a reverse cross-link back into this set (they currently link forward to each other but not into l3-01–04). I didn't edit either file here since I only have partial excerpts of their current content in context — safer to do that edit with the full file in hand.
- The four new lessons only add tags already implied by the manifest's existing `t1059.001`/`t1027`/etc. convention seen elsewhere (e.g. `l3-05`'s `t1547.001`). If you'd rather keep tags exactly as they were pre-patch, drop the added ATT&CK-code tags and keep the original two-tag arrays — nothing in the lesson content depends on the tag list itself.
