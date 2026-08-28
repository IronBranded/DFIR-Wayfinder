/**
 * macb-calculator.js
 * ----------------------------------------------------------------------------
 * A small interactive widget: pick a file operation, see exactly which of
 * the eight NTFS timestamps ($SI M/A/C/B and $FN M/A/C/B) actually update.
 * The rule data here is the same, already-sourced table from this academy's
 * $MFT & Timestomping lesson (Level 2) - this widget doesn't derive or
 * guess anything, it just makes that table interactive.
 *
 * Mounted into the "SI/FN Calculator" reference page by app.js after that
 * page's markdown content renders.
 *
 * Exposes: window.MACBCalculator.mount(containerEl)
 * ----------------------------------------------------------------------------
 */
(function () {
  "use strict";

  // M / A / C / B order matches this academy's own stated convention
  // (Modified, Accessed, Changed, Born) - see the $MFT lesson in Level 2.
  const OPERATIONS = [
    {
      id: "rename",
      label: "Rename (same directory)",
      si: [false, false, true, false],
      fn: [false, false, false, false],
      note: "A pure rename only touches the $SI MFT-entry-modified field. Neither attribute's Created or Modified value moves.",
    },
    {
      id: "local-move",
      label: "Local move (same volume)",
      si: [false, false, true, false],
      fn: [true, false, true, false],
      note: "Same-volume moves update $FN's Modified and Changed fields, since the parent-directory reference embedded in $FILE_NAME changed - but neither attribute's Created value moves.",
    },
    {
      id: "cross-volume-move",
      label: "Cross-volume move",
      si: [false, true, true, false],
      fn: [true, true, true, true],
      note: "Mechanically a copy-then-delete: $FN gets an entirely fresh record (all four fields), while Windows deliberately preserves the original $SI Created value for continuity. This is the one case where $FN Created ends up later than $SI Created - the same shape as the timestomping red flag, produced with zero tampering. Cross-check the USN Journal before concluding otherwise.",
    },
    {
      id: "copy",
      label: "Copy",
      si: [false, true, true, true],
      fn: [true, true, true, true],
      note: "A copy inherits the source's $SI Modified time (preserved on purpose) while stamping $SI Created fresh - so Modified earlier than Created is the normal signature of a copy, not evidence of tampering on its own.",
    },
    {
      id: "open-read",
      label: "Open / read",
      si: [false, true, false, false],
      fn: [false, false, false, false],
      note: "Only $SI Accessed is even a candidate for updating here - and on most modern enterprise endpoints, Last Access tracking is switched off by default above roughly 128 GB of system volume size.",
    },
    {
      id: "write-modify",
      label: "Write / modify content",
      si: [true, false, true, false],
      fn: [false, false, false, false],
      note: "Content changes update $SI Modified and the MFT-entry-modified field. $FN is untouched entirely - it doesn't track content.",
    },
    {
      id: "create",
      label: "Create (new file)",
      si: [true, true, true, true],
      fn: [true, true, true, true],
      note: "Every field in both attributes gets stamped at once, from the same clock read - which is exactly why a freshly created file's SI and FN values start out identical.",
    },
    {
      id: "delete",
      label: "Delete",
      si: [false, false, false, false],
      fn: [false, false, false, false],
      note: "Deletion flags the MFT record as unallocated but does not touch a single timestamp field - which is exactly why a timestamp recovered from a deleted-but-not-yet-overwritten record still describes the file's real working life.",
    },
  ];

  const FIELDS = ["M", "A", "C", "B"];
  const FIELD_LABELS = ["Modified", "Accessed", "Changed", "Born"];

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function buildOptions() {
    return OPERATIONS.map((op) => `<option value="${op.id}">${op.label}</option>`).join("");
  }

  function tableHTML(title, code, values) {
    const cells = values
      .map(
        (updates, i) =>
          `<td class="macb-cell ${updates ? "macb-cell--update" : "macb-cell--nochange"}">
            <div class="macb-cell-letter">${FIELDS[i]}</div>
            <div class="macb-cell-state">${updates ? "Update" : "\u2014"}</div>
          </td>`
      )
      .join("");
    return `
      <div class="macb-table-wrap">
        <div class="macb-table-title">${title} <code>${code}</code></div>
        <table class="macb-table"><tbody><tr>${cells}</tr></tbody></table>
      </div>`;
  }

  function render(widget, opId) {
    const op = OPERATIONS.find((o) => o.id === opId) || OPERATIONS[0];
    widget.querySelector("#macb-tables").innerHTML =
      tableHTML("$STANDARD_INFORMATION", "0x10", op.si) + tableHTML("$FILE_NAME", "0x30", op.fn);
    widget.querySelector("#macb-note").textContent = op.note;
  }

  function mount(container) {
    if (!container) return;
    container.innerHTML = "";

    const widget = el(`
      <div class="macb-calc" role="group" aria-label="SI/FN timestamp calculator">
        <div class="naming-builder-head">
          <h3>SI/FN Timestamp Calculator</h3>
          <p>Pick an operation, see exactly which of the eight NTFS timestamps update. Same rules as the Level 2 $MFT lesson, made interactive - nothing here is derived on the fly.</p>
        </div>
        <label class="naming-field" style="max-width:420px">
          <span>Operation</span>
          <select id="macb-op">${buildOptions()}</select>
        </label>
        <div id="macb-tables" class="macb-tables"></div>
        <p id="macb-note" class="text-secondary" style="font-size:var(--fs-sm)"></p>
        <div class="macb-legend">
          <span><span class="macb-legend-swatch macb-legend-swatch--update"></span> Timestamp is rewritten</span>
          <span><span class="macb-legend-swatch macb-legend-swatch--nochange"></span> Existing value survives</span>
        </div>
      </div>
    `);
    container.appendChild(widget);

    const select = widget.querySelector("#macb-op");
    select.addEventListener("change", () => render(widget, select.value));
    render(widget, select.value);
  }

  window.MACBCalculator = { mount };
})();
