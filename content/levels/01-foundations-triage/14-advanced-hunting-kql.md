Reading individual Defender events one at a time answers questions about one machine. Advanced Hunting queries the same telemetry across the whole fleet at once, which is what turns "this host looks odd" into "seventeen hosts show this pattern and here is the first one."

## The tables that matter for endpoint work

| Table | Contains |
|---|---|
| `DeviceProcessEvents` | Process creation, command lines, parent process |
| `DeviceNetworkEvents` | Outbound and inbound connections with the initiating process |
| `DeviceFileEvents` | File creation, modification, deletion |
| `DeviceRegistryEvents` | Registry key and value changes |
| `DeviceImageLoadEvents` | Module loads — the [DLL hijacking](#/lesson/l5-05-com-dll-hijacking) detection source |
| `DeviceLogonEvents` | Logons observed on the device |
| `DeviceEvents` | A catch-all for other telemetry, including AMSI and ASR events |

## KQL in five operators

```kusto
DeviceProcessEvents                          // start with a table
| where Timestamp > ago(7d)                  // filter
| where FileName == "powershell.exe"
| project Timestamp, DeviceName, ProcessCommandLine   // choose columns
| summarize count() by DeviceName            // aggregate
| order by count_ desc                       // sort
```

Filter **first**, before projecting or summarizing. It reduces the working set for everything downstream and is the difference between a query that returns and one that times out.

## Patterns worth memorizing

**Office spawning a shell** — the [process tree](#/lesson/l3-04-process-trees) red flag, expressed as a query:

```kusto
DeviceProcessEvents
| where InitiatingProcessFileName in~ ("winword.exe","excel.exe","outlook.exe","powerpnt.exe")
| where FileName in~ ("powershell.exe","cmd.exe","mshta.exe","wscript.exe","rundll32.exe")
```

**Encoded PowerShell** — [obfuscation](#/lesson/l3-14-powershell-obfuscation) at fleet scale:

```kusto
DeviceProcessEvents
| where FileName =~ "powershell.exe"
| where ProcessCommandLine has_any ("-enc","-EncodedCommand","-e ")
```

**Rare-process hunting by prevalence** — finds anomalies without a prior signature:

```kusto
DeviceProcessEvents
| where Timestamp > ago(30d)
| summarize DeviceCount = dcount(DeviceId) by FileName, FolderPath
| where DeviceCount <= 2
```

**LSASS access** — the [credential theft](#/lesson/l3-09-lsass-memory-analysis) signal:

```kusto
DeviceEvents
| where ActionType == "OpenProcessApiCall"
| where FileName =~ "lsass.exe"
```

## Performance habits

Use **`has`** rather than **`contains`** where you can — `has` matches whole terms and uses the index, `contains` scans substrings and does not. Avoid leading wildcards for the same reason. Use `=~` for case-insensitive equality rather than lowercasing both sides. Put the tightest filter first.

## Normal baseline

Queries return volumes you can reason about. Prevalence hunts surface a handful of rare binaries, nearly all explainable as legitimate niche software. The Office-spawning-shell query returns nothing on a healthy fleet — which is exactly why it makes a good standing detection.

## How to collect it

Advanced Hunting lives in the Microsoft Defender portal, with a default 30-day retention window. Queries can be saved, shared, and — as [the next lesson](#/lesson/l1-15-detection-engineering) covers — promoted into custom detection rules that run automatically rather than when someone remembers to look.

## ATT&CK mapping

Query patterns above map to [Command and Scripting Interpreter (T1059)](https://attack.mitre.org/techniques/T1059/), [Obfuscated Files or Information (T1027)](https://attack.mitre.org/techniques/T1027/), and [OS Credential Dumping: LSASS Memory (T1003.001)](https://attack.mitre.org/techniques/T1003/001/).

## Sources

- [Microsoft Learn — Advanced hunting in Microsoft Defender XDR](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview)
- [Microsoft Learn — KQL quick reference](https://learn.microsoft.com/en-us/azure/data-explorer/kql-quick-reference)
