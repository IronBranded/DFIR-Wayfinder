**Scenario.** A process tree captured from a live host. Fifteen minutes. Which branches are wrong, and — just as important — which look wrong but are not?

## The data

```
System (4)
└── smss.exe (392)
    ├── csrss.exe (512)
    ├── wininit.exe (588)
    │   ├── services.exe (668)
    │   │   ├── svchost.exe (812)  -k RPCSS
    │   │   ├── svchost.exe (904)  -k netsvcs
    │   │   ├── spoolsv.exe (1420)
    │   │   └── MsMpEng.exe (1688)
    │   └── lsass.exe (676)
    │       └── rundll32.exe (4512)
    └── winlogon.exe (620)

explorer.exe (2104)          [parent 1876 — not running]
├── chrome.exe (3288)
├── OUTLOOK.EXE (3540)
└── winword.exe (4180)
    └── powershell.exe (4396)  -w hidden -enc SQBFAFgA...

svchost.exe (4820)  [parent: powershell.exe (4396)]
```

## Work through it

**Finding 1 — `lsass.exe` has a child.**

`rundll32.exe` parented by `lsass.exe` (PID 676). From [the baseline](#/lesson/l2-10-process-trees): there is exactly one `lsass.exe`, its parent is `wininit.exe`, and **it has no children, ever**. This is the strongest single indicator in the tree, and given the `rundll32.exe` involvement, [credential access](#/lesson/l5-08-lsass-memory-analysis) is the working hypothesis.

**Finding 2 — Office spawning a shell.**

`winword.exe` → `powershell.exe`, with `-w hidden` and `-enc`. Word has no legitimate reason to launch a script interpreter. The [flag cluster](#/lesson/l3-04-powershell-malicious-patterns) compounds it, and the encoded command is a [decode job](#/lesson/l3-02-powershell-obfuscation).

**Finding 3 — `svchost.exe` with the wrong parent.**

PID 4820, parented by `powershell.exe`. `services.exe` is the **only** legitimate parent of `svchost.exe`, and this one also has no `-k` argument. Two independent violations in one process.

## The one that is not a finding

`explorer.exe` (2104) shows **parent PID 1876, not running**.

This is normal. `userinit.exe` launches `explorer.exe` and then **exits by design**, leaving `explorer.exe` orphaned with a parent PID pointing at a process that no longer exists. Tools that flag "missing parent" report this on every healthy Windows system.

> [!WARNING]
> Flagging the orphan is the mistake this drill is built around. Knowing what is normal is what stops a real finding from being buried under three false ones — which is the entire argument for learning the baseline before the anomalies.

## Priority order

1. `lsass.exe` → `rundll32.exe` — active credential theft, contain now
2. `svchost.exe` under `powershell.exe` — masquerading payload
3. `winword.exe` → `powershell.exe` — the initial access vector; decode the command to learn what was fetched
4. `explorer.exe` orphan — no action
