/**
 * markdown.js
 * ----------------------------------------------------------------------------
 * A small, dependency-free Markdown -> HTML renderer, purpose-built for this
 * project's lesson content. It supports the subset of Markdown the lessons
 * actually use: headings, paragraphs, bold/italic/code, fenced code blocks,
 * lists, tables, links, images, hr, and GitHub-style alert blockquotes
 * (> [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]) plus custom
 * [!LAB] (hands-on exercise) and [!PLAIN] (plain-language translation of a
 * technical term or concept just introduced) extensions.
 *
 * Kept dependency-free on purpose: the whole academy runs with zero build
 * step and zero CDN dependencies, so a page never breaks because a third
 * party script failed to load.
 *
 * Exposes: window.MDRender.toHTML(markdownString) -> htmlString
 * ----------------------------------------------------------------------------
 */
(function () {
  "use strict";

  const CALLOUT_ICONS = {
    note: "info",
    tip: "lightbulb",
    important: "star",
    warning: "alert-triangle",
    caution: "skull",
    lab: "terminal",
    plain: "translate",
  };

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Inline-level formatting: code spans, bold, italic, links, images.
  function renderInline(text) {
    // Protect inline code first so markup inside it isn't touched.
    const codeSpans = [];
    text = text.replace(/`([^`]+)`/g, (_, code) => {
      codeSpans.push(escapeHtml(code));
      return `\u0000CODE${codeSpans.length - 1}\u0000`;
    });

    text = escapeHtml(text);

    // Images ![alt](src)
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
      (_, alt, src, title) => `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ""} loading="lazy">`);

    // Links [text](href)
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, label, href, title) => {
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${href}"${title ? ` title="${title}"` : ""}${attrs}>${label}</a>`;
    });

    // Bold + italic combined (***x***), then bold (**x**), then italic (*x*)
    text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Restore code spans
    text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `<code>${codeSpans[Number(i)]}</code>`);

    return text;
  }

  function renderTable(lines) {
    const header = lines[0].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const rows = lines.slice(2).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    let html = "<table><thead><tr>";
    header.forEach((h) => (html += `<th>${renderInline(h)}</th>`));
    html += "</tr></thead><tbody>";
    rows.forEach((r) => {
      html += "<tr>";
      r.forEach((c) => (html += `<td>${renderInline(c)}</td>`));
      html += "</tr>";
    });
    html += "</tbody></table>";
    return html;
  }

  function renderCallout(type, bodyLines) {
    const kind = type.toLowerCase();
    const icon = CALLOUT_ICONS[kind] || "info";
    const inner = toHTML(bodyLines.join("\n"));
    return `<div class="callout callout--${kind}">
      <div class="callout-title">${iconSvg(icon)}<span>${kind}</span></div>
      ${inner}
    </div>`;
  }

  function iconSvg(name) {
    const paths = {
      info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
      lightbulb: '<path d="M9 18h6M10 22h4M15 9a3 3 0 1 0-6 0c0 1.5 1 2 1 3.5V14h4v-1.5c0-1.5 1-2 1-3.5Z"/>',
      star: '<polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2"/>',
      "alert-triangle": '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      skull: '<circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="M12.5 17-2 17c-3.5 0-7-2.5-7-6.5A7.5 7.5 0 0 1 12 3a7.5 7.5 0 0 1 7.5 7.5c0 4-3.5 6.5-7 6.5Z"/>',
      terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
      translate: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.info}</svg>`;
  }

  function toHTML(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let i = 0;
    let listBuffer = null; // { type: 'ul'|'ol', items: [] }

    function flushList() {
      if (!listBuffer) return;
      const tag = listBuffer.type;
      html += `<${tag}>` + listBuffer.items.map((it) => `<li>${renderInline(it)}</li>`).join("") + `</${tag}>`;
      listBuffer = null;
    }

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code block
      const fence = line.match(/^```(\S*)\s*$/);
      if (fence) {
        flushList();
        const lang = fence[1] || "text";
        const codeLines = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing fence
        const codeText = escapeHtml(codeLines.join("\n"));
        html += `<div class="code-block" data-lang="${lang}">
          <div class="code-block-head"><span>${lang}</span>
            <button class="code-copy-btn" type="button" data-copy-target aria-label="Copy code">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              copy
            </button>
          </div>
          <pre><code>${codeText}</code></pre>
        </div>`;
        continue;
      }

      // GitHub-style alert blockquote: > [!TYPE] ... subsequent > lines
      const alertStart = line.match(/^>\s*\[!(\w+)\]\s*$/i);
      if (alertStart) {
        flushList();
        const type = alertStart[1];
        const body = [];
        i++;
        while (i < lines.length && /^>/.test(lines[i])) {
          body.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        html += renderCallout(type, body);
        continue;
      }

      // Table (header + separator row)
      if (/^\|.+\|\s*$/.test(line) && lines[i + 1] && /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(lines[i + 1])) {
        flushList();
        const tblLines = [line];
        let j = i + 1;
        while (j < lines.length && /^\|.+\|\s*$/.test(lines[j])) {
          tblLines.push(lines[j]);
          j++;
        }
        html += renderTable(tblLines);
        i = j;
        continue;
      }

      // Headings
      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        flushList();
        const level = heading[1].length;
        const text = heading[2].replace(/\s+#*$/, "");
        const slug = text.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
        html += `<h${level} id="${slug}">${renderInline(text)}</h${level}>`;
        i++;
        continue;
      }

      // Horizontal rule
      if (/^(---|\*\*\*|___)\s*$/.test(line)) {
        flushList();
        html += "<hr>";
        i++;
        continue;
      }

      // Plain blockquote (no alert marker)
      if (/^>\s?/.test(line)) {
        flushList();
        const body = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          body.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        html += `<blockquote>${toHTML(body.join("\n"))}</blockquote>`;
        continue;
      }

      // Unordered list
      const ulItem = line.match(/^\s*[-*]\s+(.*)$/);
      if (ulItem) {
        if (!listBuffer || listBuffer.type !== "ul") {
          flushList();
          listBuffer = { type: "ul", items: [] };
        }
        listBuffer.items.push(ulItem[1]);
        i++;
        continue;
      }

      // Ordered list
      const olItem = line.match(/^\s*\d+\.\s+(.*)$/);
      if (olItem) {
        if (!listBuffer || listBuffer.type !== "ol") {
          flushList();
          listBuffer = { type: "ol", items: [] };
        }
        listBuffer.items.push(olItem[1]);
        i++;
        continue;
      }

      // Blank line
      if (line.trim() === "") {
        flushList();
        i++;
        continue;
      }

      // Paragraph: gather contiguous non-blank, non-special lines
      flushList();
      const paraLines = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !/^(#{1,4})\s+/.test(lines[i]) &&
        !/^```/.test(lines[i]) &&
        !/^>/.test(lines[i]) &&
        !/^\s*[-*]\s+/.test(lines[i]) &&
        !/^\s*\d+\.\s+/.test(lines[i]) &&
        !/^(---|\*\*\*|___)\s*$/.test(lines[i])
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      html += `<p>${renderInline(paraLines.join(" "))}</p>`;
    }

    flushList();
    return html;
  }

  window.MDRender = { toHTML };
})();
