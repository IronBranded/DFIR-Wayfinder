# SI/FN Calculator

The full reasoning behind these rules lives in [Level 2's $MFT & Timestomping lesson](#/lesson/l4-05-mft-timestomping) — this page exists to make that table interactive rather than something to re-derive by hand mid-investigation.

Every NTFS file stores its MACB timestamps twice: once in `$STANDARD_INFORMATION` (`0x10`, what Explorer shows), once in `$FILE_NAME` (`0x30`, maintained far more restrictively by the kernel). The two sets diverge under everyday, non-adversarial operation — this calculator shows exactly how, for the eight operations that come up constantly in real casework.
