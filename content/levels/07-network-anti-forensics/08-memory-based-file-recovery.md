[File carving](#/lesson/l7-04-file-carving) recovers what was written to disk and deleted. This lesson covers the case where it was **never written to disk at all** — the payload a [download cradle](#/lesson/l3-04-powershell-malicious-patterns) fetched straight into memory, the assembly loaded reflectively, the script that existed only as a string.

## What memory holds that disk does not

**Injected code.** A PE image mapped into another process's address space by any of the [injection techniques](#/lesson/l5-05-injection-techniques) exists as executable memory with no file backing it. Dumping that region recovers the actual payload for analysis.

**Page-cached file content.** Windows caches recently-read file data in memory. A file deleted from disk moments ago may still have its contents cached — recoverable from a memory image even though the on-disk data is already unallocated.

**Decrypted content.** A file encrypted at rest must be decrypted to be used. While it is open, the plaintext is in memory. This applies to encrypted archives an attacker staged, to protected documents, and to configuration files holding credentials.

**Transient artifacts** — command output, clipboard contents, and typed strings that were never intended to touch disk at all.

## The Volatility plugins

```
windows.dumpfiles --pid <PID>      # extract file objects mapped by a process
windows.malfind --dump             # dump the injected regions malfind flags
windows.memmap --pid <PID> --dump  # dump a process's entire address space
```

`windows.malfind --dump` is the most directly useful of the three for this purpose: it identifies [injected regions](#/lesson/l5-04-injected-code-detection) and writes them out in a single step, producing the payload without any need to reconstruct it manually.

## Limitations worth stating plainly

- **Content may be partial.** Only cached or currently-mapped pages are present. A recovered file may be missing arbitrary sections.
- **Content may be stale.** What is in memory is what was read or written at some point, not necessarily the current state.
- **No guarantee of completeness**, and usually no way to prove completeness from memory alone.

Recovered content should therefore be treated as **a sample of the artifact rather than the artifact**, and characterized accordingly in reporting — which connects directly to the confidence-language discipline in [reporting](#/lesson/l1-10-reporting-communication).

## Why this closes the loop

The reason [memory acquisition comes first](#/lesson/l5-01-acquisition) in the collection order is not only that it is volatile. It is that memory is the **only** source for an entire class of artifact — anything that deliberately avoided the filesystem. A host powered off before capture does not just lose process state; it loses the payload itself, permanently, with no other recovery path.

## Red flags

- **A dumped injected region containing a full PE header** — an entire executable resident only in memory.
- **Recovered decrypted content** of a file that is encrypted on disk.
- **Cached content of a file no longer present on the filesystem.**
- **A recovered payload matching known-bad indicators** when nothing on disk did.

## How to collect it

Acquire memory per [the acquisition lesson](#/lesson/l5-01-acquisition), then run `windows.malfind --dump` for injected code and `windows.dumpfiles` for mapped file objects. Hash everything recovered before analysis, and record clearly that it came from memory rather than disk — provenance matters when the recovered artifact is incomplete by nature.

## ATT&CK mapping

Recovery technique countering [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/), [Reflective Code Loading (T1620)](https://attack.mitre.org/techniques/T1620/), and [Ingress Tool Transfer (T1105)](https://attack.mitre.org/techniques/T1105/).

## Sources

- [Volatility 3 — Windows plugin documentation](https://volatility3.readthedocs.io/en/latest/)
- MITRE ATT&CK — T1055, T1620
